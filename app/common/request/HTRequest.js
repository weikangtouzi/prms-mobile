// import RNBugly from 'react-native-bugly'
import HTAuthManager from '~/common/auth/common/model/HTAuthManager'
import HTServerManager from '~/common/debug/HTServerManager'
import HTSocket from './HTSocket'
import HTThrowPromise from './HTThrowPromise'
import { DeviceEventEmitter } from 'react-native'

export default class HTRequest {

	static _fetch = (url, method, headers, body, resolve, reject, finallyAll) => {
		fetch(url, {
			method,
			headers,
			body
		})
		.then(response => {
			// RNBugly.log('w', 'response', `${url} -> ${response}`)
			return response?.json()
		})
		.then(resolve)
		.catch(reject)
		.finally(finallyAll)
	}

	static request = (url = '', method = 'GET', paramList = {}, optionList = {}) => {
		return new HTThrowPromise((resolve, reject) => {
			let reloadUrl = `${HTServerManager.currentServer.base}${url}`
			let isFormData = paramList instanceof FormData
			let body = paramList
			switch(method.toUpperCase()) {
				case 'GET': {
					let keyValueList = []
					Object.keys(paramList).map(key => keyValueList.push(`${encodeURIComponent(key)}=${encodeURIComponent(paramList[key])}`))
					if ((keyValueList.length ?? 0) > 0) {
						reloadUrl = `${reloadUrl}?${keyValueList.join('&')}`
					}
					body = ''
					break
				}
				default: {
					if (!isFormData) {
						body = JSON.stringify(paramList)
					}
					break
				}
			}
			let showLoading = optionList?.showLoading ?? method.toUpperCase() != 'GET'
			let showError = optionList?.showError ?? true
			showLoading && global?.Hud && global.Hud.show()

			let reloadReject = (error) => {
				error && showError && global?.Toast && global?.Toast.show(error + '')
				reject(error)
			}
			let reloadResolve = (response) => {
				this.handlerResponse(response, fetchRequest, () => {
					try {
						let value = response?.data && paramList?.operationName
						value = value ? response?.data[paramList?.operationName] : null
						value = value ?? response
						resolve(value)
					} catch(error) {
						reject(error)
					}
				}, reloadReject)
			}

			let reloadFinally = () => {
				showLoading && global?.Hud && global.Hud.hidden()
			}

			let fetchRequest = () => {
				this._fetch(reloadUrl, method, {
					'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
					Authorization: HTAuthManager?.keyValueList?.userToken ?? '',
				}, body, reloadResolve, reloadReject, reloadFinally)
			}
			fetchRequest()
		})
	}

	static handlerResponse = (response, repeat, resolve, reject) => {
		let error = response['errors']
		if (Array.isArray(error) && (error?.length ?? 0) > 0) {
			error = error[0]?.extensions?.exception?.stacktrace
			if (Array.isArray(error) && (error?.length ?? 0) > 0) {
				error = error[0]
			}
		}
		if (typeof(error) == 'string' && (error?.length ?? 0) > 0) {
			if (error == 'AuthenticationError: token expired') {
				HTAPI.UserRefreshToken().then(response => {
					Toast.show('刷新 token 成功1')
					HTAuthManager.updateKeyValueList({ userToken: response })
					repeat()
					Toast.show('刷新 token 成功2')
				}).catch(() => {
					Toast.show('刷新 token 失败1')
					HTAuthManager.clearLoginInfo()
					// 如果 UserRefreshToken 请求成功，repeat 会处理页面传进来的 then 和 catch
					// 如果 UserRefreshToken 请求出错了，就没人处理页面传进来的 then 和 catch
					reject()
					Toast.show('刷新 token 失败2')
				})
				return
			} else if (error == 'AuthenticationError: missing authorization') {
				HTAuthManager.clearLoginInfo()
			}
			reject(error)
			return
		}
		resolve(response)
	}

	static gqlRequest = (item, operationName, paramList = {}, optionList = {}) => {
		return this.request('/graphql', 'POST', {
			'operationName': operationName,
			'variables': paramList,
			'query': item
		}, optionList)
	}

	static gqlUpload = (config) => {
		let formData = new FormData()
		formData.append('operations', JSON.stringify({
			'operationName': 'CommonSingleUpload',
			'variables': { 'file': null },
			'query': `
				mutation CommonSingleUpload($file: Upload!, $extraAttributes: UploadExtraAttributes) {
					CommonSingleUpload(file: $file, extraAttributes: $extraAttributes)
				}
			`
		}))
		formData.append('map', JSON.stringify({ "1": ['variables.file'] }))
		formData.append('1', config)
		return this.request('/graphql', 'POST', formData)
	}


	static initSocket = () => {
		this?.userRolelistener?.remove()
		this?.userTokenlistener?.remove()
		this.userRolelistener = DeviceEventEmitter.addListener(HTAuthManager.kHTUserRoleDidChangeNotice, () => {
			this.initSocket()
		})
		this.userTokenlistener = DeviceEventEmitter.addListener(HTAuthManager.kHTUserTokenDidChangeNotice, () => {
			this.initSocket()
		})
		let token = HTAuthManager?.keyValueList?.userToken ?? ''
		let role = HTAuthManager?.keyValueList?.userRole ?? ''
		if (token.length <= 0 || role.length <= 0) {
			return
		}
		if (this.socket) {
			this.socket.listenerList = []
			this.socket.close()
		}

		let url = HTServerManager.currentServer.detail
		let protocolList = ['graphql-ws', 'graphql-transport-ws']
		this.socket = new HTSocket(url, protocolList)
		this.socket.addListener((data) => {
			if (data?.type != 'data') {
				return
			}
			this.handlerResponse(data?.payload, this.initSocket, (value) => {
				let content = value?.data
				if (content?.newMessage) {
					DeviceEventEmitter.emit(HTAuthManager.kHTSocketMessageDidReceiveNotice, content?.newMessage)
				} else if (content?.newContract) {
					DeviceEventEmitter.emit(HTAuthManager.kHTSocketContractDidReceiveNotice, content?.newContract)
				}
			}, (error) => {
				this.initSocket()
			})
		})
		this.socket.connect(() => {
			this.socket.send({ 'type': 'connection_init', 'payload': {'Authorization': token } })
			this.socket.send({ id: '1', 'type': 'start', 'payload': {
				'query': `
					subscription newMessage {
						newMessage {
							from messageType messageContent to uuid createdAt
						}
					}
				 `
			} })
			// this.socket.send({ id: '2', 'type': 'start', 'payload': {
			// 	'query': `
			// 		subscription newContract {
			// 			newContract {
			// 				id logo name pos ent last_msg last_msg_time job
			// 			}
			// 		}
			// 	 `
			// } })
		})
	}

}