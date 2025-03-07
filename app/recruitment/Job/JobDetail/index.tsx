import React, { useState, useEffect, Component } from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import IconButton from '../../components/IconButton'
import JobMeta from './JobMeta'
import JobIntro from './JobIntro'
import CompanyInfo from './CompanyInfo'
import Audit from './Audit'
import GhostButton from '../../components/GhostButton'
import GradientButton from '../../components/GradientButton'
import { getBottomSpace, isIphoneX } from 'react-native-iphone-x-helper'
import AlertModal from '../../components/AlertModal'
import NavBar from '../../components/NavBar'
import { JobParamList } from '../typings'
import useJobDetail from './useJobDetail'
import LoadingAndError from '../../components/LoadingAndError'
import useHideJob from './useHideJob'
import JobOffline from './JobOffline'
import { useOpenJob } from './useOpenJob'
import {
  stirngForSalary,
  stringForEducation,
  stringForEnterpriseNature,
  stringForEnterpriseSize,
  stringForExperience,
  stringForFullTime,
} from '../../utils/JobHelper'

export default class JobDetail extends Component {

	constructor(props) {
		super(props)
		this.state = {
			stopHireModalVisible: false,
			itemList: null,
		}
	}

	componentDidMount() {
		this._onRefresh()
	}

	componentDidAppear({ isSecondAppear }) {
		if (isSecondAppear) {
			this._onRefresh()
		}
	}

	_onRefresh = () => {
		const { jobId, status } = this.props.navigation.state.params
		HTAPI.UserGetJob({ jobid: jobId }).then(response => {
	  		const { job, company } = response

		    const nature = stringForEnterpriseNature(company.business_nature)
		    const scale = stringForEnterpriseSize(company.enterprise_size)
		    const industry =
		      company.industry_involved[company.industry_involved.length - 1]

		    this.state.itemList = {
		      remoteJob: job,
		      job: {
		      	id: job.id,
		        title: job.title,
		        salary: stirngForSalary(job.salaryExpected),
		        jobNature: stringForFullTime(job.full_time_job),
		        headcount: `招 ${job.required_num} 人`,
		        experience: stringForExperience(job.experience, true),
		        education: stringForEducation(job.education || undefined, true),
		        address: job.address_description.slice(3).join('·'),
		        tags: job.tags,
		        description: job.detail,
		        status: job?.status ?? status,
		      },
		      company: {
		      	id: company?.id,
		        logo: company.enterprise_logo,
		        name: company.name,
		        labels: [nature, scale, industry],
		        address: `${company.address_description[4]}${company.address_description[5]}${company.address_description[6]}`,
		        coordinate: company?.address_coordinates,
		      },
		      jobEdit: {
		      	id: job.id,
		        jobId: job.id,
		        jobName: job.title,
		        jobDescription: job.detail,
		        jobNature: job.full_time_job,
		        jobCategory: job.category,
		        experience: job.experience,
		        education: job.education || undefined,
		        salary: job.salaryExpected,
		        tags: job.tags,
		        headcount: job.required_num,
		        coordinates: job.address_coordinate as [number, number],
		        workingAddress: job.address_description,
		      },
		      jobReOpen: {
		      	id: job.id,
		      	jobTitle: job.title,
		      	workingAddress: job.address_description,
		      	experience: job.experience,
		      	salary: job.salaryExpected,
		      	education: job?.education ?? 'Null',
		      	description: job.detail,
		      	requiredNum: job.required_num,
		      	isFullTime: job.full_time_job,
		      	tags: job.tags || [],
		      	coordinates: job.address_coordinate,
		      	publishNow: true,
		      	category: job.category,
		      }
		    }
		    this.setState(this.state)
	  	})
	}

	render() {
		const { jobId } = this.props.navigation.state.params
		const { itemList: detail, stopHireModalVisible } = this.state
		const navigation = this.props.navigation
		return (
			<View style={styles.container}>
		      <NavBar
		        style={{ backgroundColor: '#F8F8F8' }}
		        title=""
		        headerRight={() => (
		          <IconButton
		            icon={require('./images/share.png')}
		            style={styles.shareIcon}
		            onPress={global.TODO_TOAST}
		          />
		        )}
		      />
		      <LoadingAndError
		        style={{ backgroundColor: '#F8F8F8' }}
		        loading={false}
		        error={null}
		        refetch={null}>
		        {detail && (
		          <>
		            <ScrollView
		              style={styles.container}
		              contentContainerStyle={styles.content}>
		              {detail.job.status === 'NotPublishedYet' && (
		                <Audit status="审核中" />
		              )}
		              {detail.job.status === 'OffLine' && <JobOffline />}
		              <JobMeta job={detail.job} />
		              <JobIntro job={detail.job} />
		              <CompanyInfo company={detail.company} navigation={navigation} />
		            </ScrollView>
		            <View style={styles.buttons}>
		              <GhostButton
		                style={styles.ghost}
		                title="编辑职位"
		                onPress={() =>
		                  navigation.push('PostJob', {
		                    ...detail.jobEdit,
		                  })
		                }
		              />
		              {detail.job.status === 'OffLine' ? (
		                <GradientButton
		                  style={styles.gradient}
		                  title="开放职位"
		                  onPress={async () => {
		                  	Hud.show('请稍后...')
		                  	HTAPI.HREditJob({
		                  		info: detail.jobReOpen
		                  	}).then(response => {
		                  		Hud.hidden()
		                  		Toast.show('操作成功！')
		                  		navigation.pop()
		                  	})
		                  }}
		                />
		              ) : (
		                <GradientButton
		                  style={styles.gradient}
		                  title="停止招聘"
		                  onPress={() => this.setState({ stopHireModalVisible: true })}
		                />
		              )}
		            </View>
		          </>
		        )}
		      </LoadingAndError>

		      <AlertModal
		        visible={stopHireModalVisible}
		        title="温馨提示"
		        msg="停止招聘后，职位信息将不会在求职端展示"
		        onNegativePress={() => this.setState({ stopHireModalVisible: false })}
		        onPositivePress={async () => {
					this.setState({ stopHireModalVisible: false })
					Hud.show('请稍后...')
					HTAPI.HRHideJob({ jobId: jobId }).then(response => {
						Hud.hidden()
						Toast.show('操作成功！')
						navigation.pop()
					})
		        }}
		      />
		    </View>
		)
	}

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    backgroundColor: '#F8F8F8',
  },
  shareIcon: {
    marginRight: 10,
  },
  buttons: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingTop: 5,
    paddingBottom: isIphoneX() ? getBottomSpace() + 5 : 5,
  },
  ghost: {
    flex: 1,
  },
  gradient: {
    width: 190,
    marginLeft: 14,
  },
})
