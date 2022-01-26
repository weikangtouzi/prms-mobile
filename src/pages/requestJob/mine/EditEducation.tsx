import React, { Component } from 'react'
import { Text, View, Image, ScrollView, StatusBar, BackHandler } from 'react-native'
import styles from './styles/EditEducation.style'
import { GenProps } from '../../../navigator/requestJob/stack'
import NavBar, { EButtonType } from '../../components/NavBar'
import NextTouchableOpacity from '../../components/NextTouchableOpacity'
import { TextInput } from 'react-native-gesture-handler'
import JobStatusModal from '../jobs/JobStatusModal'
import { AnyMxRecord } from 'dns'
import GradientButton from '../../components/GradientButton'
import AlertContentModal from '../../components/AlertContentModal'
import SystemHelper from '../../../utils/system'
import RootLoading from '../../../utils/rootLoading'
import { editEduExperience, removeCandidateEditEduExp } from '../../../action/mineAction'
import { selectEducation } from '../../../utils/utils'

type IProps = GenProps<'EditEducation'> & {

}

interface IState {
  educationItem: any,
  name: string,
  education: string,
  fullTime: string,
  educationVisible: boolean,
  professional: string,
  beginTime: string,
  endTime: string,
  schoolExperience: string,
  beginTimeVisible: boolean,
  beginTimeArray: any,
  beginDateArray: any,
  educationLevel: any,
  educationAllDay: any,
  deleteVisible: boolean,
  giveUpSaveVisible: boolean
}

export default class EditEducation extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    const { route: { params: { educationItem } } } = props
    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid)
    this.state = {
      educationItem,
      name: (educationItem && educationItem.school_name) || '',
      education: (educationItem && educationItem.education) || '',
      fullTime: (educationItem && educationItem.is_all_time ? '全日制' : '非全日制') || '',
      professional: (educationItem && educationItem.major) || '',
      beginTime: (educationItem && educationItem.time && educationItem.time.split('-')[0]) || '',
      endTime: (educationItem && educationItem.time.split('-') && educationItem.time.split('-').length > 1 && educationItem.time.split('-')[1]) || '',
      schoolExperience: (educationItem && educationItem.exp_at_school) || '',
      beginTimeVisible: false,
      educationVisible: false,
      deleteVisible: false,
      giveUpSaveVisible: false,
      beginTimeArray: [
        { label: '2021', value: '2021' },
        { label: '2020', value: '2020' },
        { label: '2019', value: '2019' },
        { label: '2018', value: '2018' },
        { label: '2017', value: '2017' },
        { label: '2016', value: '2016' },
        { label: '2015', value: '2015' },
        { label: '2014', value: '2014' },
        { label: '2013', value: '2013' },
        { label: '2012', value: '2012' },
        { label: '2011', value: '2011' },
        { label: '2010', value: '2010' },
      ],
      beginDateArray: [
        { label: '2021', value: '2021' },
        { label: '2020', value: '2020' },
        { label: '2019', value: '2019' },
        { label: '2018', value: '2018' },
        { label: '2017', value: '2017' },
        { label: '2016', value: '2016' },
        { label: '2015', value: '2015' },
        { label: '2014', value: '2014' },
        { label: '2013', value: '2013' },
        { label: '2012', value: '2012' },
        { label: '2011', value: '2011' },
        { label: '2010', value: '2010' },
      ],
      educationLevel: [
        { label: '初中', value: 'Junior' },
        { label: '高中', value: 'High' },
        { label: '大专', value: 'JuniorCollege' },
        { label: '本科', value: 'RegularCollege' },
        { label: '硕士', value: 'Postgraduate' },
        { label: '博士', value: 'Doctor' }
      ],
      educationAllDay: [
        { label: '全日制', value: '全日制' },
        { label: '非全日制', value: '非全日制' },
      ]
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid)
  }

  onBackAndroid = () => {
    // 安卓返回按钮弹出退出确认框
    const { navigation } = this.props
    const { name, professional, beginTime, endTime, schoolExperience, education, fullTime } = this.state
    const editInfo = name || professional || beginTime || endTime || schoolExperience || education || fullTime
    // const editAllInfo = name && professional && beginTime && endTime && schoolExperience && education && fullTime
    if (editInfo) {
      this.setState({ giveUpSaveVisible: true })
    } else {
      navigation.pop()
    }
    return true
  }

  renderNavBar() {
    const { name, professional, beginTime, endTime, schoolExperience, education, fullTime } = this.state
    const { navigation, route: { params: { educationItem, educationItemCallback } } } = this.props
    const editInfo = name || professional || beginTime || endTime || schoolExperience || education || fullTime
    const editAllInfo = name && professional && beginTime && endTime && schoolExperience && education && fullTime
    return (
      <NavBar
        statusBarTheme="dark-content"
        barStyle={{
          borderBottomWidth: 0,
          elevation: 0,
        }}
        left={{
          type: EButtonType.IMAGE,
          value: require('../../../assets/black_back.png'),
          act: () => {
            if (editInfo) {
              this.setState({ giveUpSaveVisible: true })
            } else {
              navigation.pop()
            }
          },
        }}
        title={educationItem ? '编辑教育经历' : '添加教育经历'}
        right={{
          type: EButtonType.TEXT,
          style: styles.saveBtn,
          value: educationItem ? '' : ' 保存',
          disable: !editAllInfo,
          act: () => {
            this.saveEduExperience()
          },
        }}
      />
    )
  }

  saveEduExperience() {
    const { name, professional, beginTime, endTime, schoolExperience, education, fullTime } = this.state
    const { navigation, route: { params: { educationItem, educationItemCallback } } } = this.props
    RootLoading.loading()
    const info: any = {
      schoolName: name,
      education,
      major: professional,
      time: `${beginTime}-${endTime}`,
      exp_at_school: schoolExperience,
      isFullTime: fullTime.indexOf('非') > -1 ? false : true,
    }
    if (educationItem && educationItem.id) {
      info.id = educationItem.id
    }
    console.log('infoinfoinfo: ', info)
    editEduExperience(info, (error) => {
      if (!error) {
        RootLoading.success('保存成功')
        if (educationItemCallback) {
          educationItemCallback()
        }
        setTimeout(() => {
          navigation.goBack()
        }, 1000)
      } else {
        RootLoading.fail(error.toString())
      }
    })
  }

  removeEduExperience() {
    const { navigation, route: { params: { educationItem, educationItemCallback } } } = this.props
    if (!educationItem || !educationItem.id) {
      RootLoading.info('配置错误,请重试或联系客服')
      return
    }
    RootLoading.loading()
    removeCandidateEditEduExp(educationItem.id, (error) => {
      if (!error) {
        RootLoading.success('删除成功')
        if (educationItemCallback) {
          educationItemCallback()
        }
        setTimeout(() => {
          navigation.goBack()
        }, 1000)
      } else {
        RootLoading.fail(error.toString())
      }
    })
  }

  renderProject() {
    const { name } = this.state
    return (
      <View style={styles.cell}>
        <Text style={styles.cellTitle}>学校</Text>
        <TextInput
          underlineColorAndroid="transparent"
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.cellInput}
          placeholder="请填写"
          placeholderTextColor="#AAAAAA"
          value={name}
          onChangeText={(value) => {
            this.setState({ name: value })
          }}
        />
      </View>
    )
  }

  renderProfessional() {
    const { professional } = this.state
    return (
      <View style={styles.cell}>
        <Text style={styles.cellTitle}>专业</Text>
        <TextInput
          underlineColorAndroid="transparent"
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.cellInput}
          placeholder="请填写"
          placeholderTextColor="#AAAAAA"
          value={professional}
          onChangeText={(value) => {
            this.setState({ professional: value })
          }}
        />
      </View>
    )
  }

  renderDurationTime() {
    const { beginTime, endTime } = this.state
    return (
      <View style={styles.cell}>
        <Text style={styles.cellTitle}>时间段</Text>
        <View style={styles.durationView}>
          <NextTouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              this.setState({ beginTimeVisible: true })
            }}
          >
            <Text style={[styles.beginTime, beginTime.length !== 0 && { color: '#333333' }]}>
              {(beginTime && endTime)
                ? `${beginTime}-${endTime}`
                : '请选择'
              }
            </Text>
          </NextTouchableOpacity>
        </View>
      </View>
    )
  }

  renderEducation() {
    const { education, fullTime } = this.state
    return (
      <View style={styles.cell}>
        <Text style={styles.cellTitle}>学历</Text>
        <View style={styles.durationView}>
          <NextTouchableOpacity
            style={{ flex: 1, }}
            onPress={() => {
              this.setState({ educationVisible: true })
            }}
          >
            <Text style={[styles.beginTime, education.length !== 0 && { color: '#333333' }]}>
              {(education && fullTime)
                ? `${selectEducation(education)}·${fullTime}`
                : '请选择'
              }
            </Text>
          </NextTouchableOpacity>
        </View>
      </View>
    )
  }

  renderSchoolExperience() {
    const { schoolExperience } = this.state
    return (
      <View style={styles.contentCell}>
        <Text style={styles.cellTitle}>在校经历</Text>
        <View style={styles.inputView}>
          <TextInput
            underlineColorAndroid="transparent"
            returnKeyType="done"
            autoCorrect={false}
            autoCapitalize="none"
            multiline={true}
            style={styles.contentInput}
            placeholder="请填写"
            placeholderTextColor="#AAAAAA"
            value={schoolExperience}
            maxLength={500}
            onChangeText={(value) => {
              this.setState({ schoolExperience: value })
            }}
          />
          <Text style={styles.contentAmount}>
            {`${schoolExperience.length}/500`}
          </Text>
        </View>
      </View>
    )
  }

  renderFooterBtn() {
    const { name, professional, beginTime, endTime, schoolExperience, education, fullTime } = this.state
    const { navigation, route: { params: { educationItem, educationItemCallback } } } = this.props
    const disableSave = name && professional && beginTime && endTime && schoolExperience && education && fullTime
    return (
      <View style={styles.footerView}>
        {educationItem && (
          <NextTouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              this.setState({ deleteVisible: true })
            }}
          >
            <Text style={styles.resetText}>删除</Text>
          </NextTouchableOpacity>
        )}
        <GradientButton
          disabled={!disableSave}
          containerStyle={[styles.confirmBtn, !educationItem && { marginLeft: 0 }]}
          linearStyle={[styles.linearStyle, !educationItem && { width: SystemHelper.width - 42, marginLeft: 0 }]}
          text="完成"
          onPress={() => {
            this.saveEduExperience()
          }}
        />
      </View>
    )
  }

  render() {
    const { beginTimeVisible, educationVisible, educationLevel, fullTime,
      educationAllDay, beginTimeArray, beginDateArray, beginTime, education,
      deleteVisible, giveUpSaveVisible
    } = this.state
    const { navigation, route: { params: { educationItem, educationItemCallback } } } = this.props
    return (
      <View style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          animated
          barStyle={'dark-content'}
        />
        {this.renderNavBar()}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {this.renderProject()}
          {this.renderEducation()}
          {this.renderProfessional()}
          {this.renderDurationTime()}
          {this.renderSchoolExperience()}
        </ScrollView>
        {educationItem && this.renderFooterBtn()}
        <JobStatusModal
          title="时间段"
          visible={beginTimeVisible}
          statusArray={beginTimeArray}
          timeArray={beginDateArray}
          currentStatus={beginTime}
          currentTime={beginTime}
          leftPress={() => {
            this.setState({ beginTimeVisible: false })
          }}
          rightPress={(selectBeginYear, selectEndYear) => {
            this.setState({
              beginTime: selectBeginYear,
              endTime: selectEndYear,
              beginTimeVisible: false,
            })
          }}
        />
        <JobStatusModal
          title="学历"
          visible={educationVisible}
          statusArray={educationLevel}
          timeArray={educationAllDay}
          currentStatus={education}
          currentTime={fullTime}
          leftPress={() => {
            this.setState({ educationVisible: false })
          }}
          rightPress={(selectedEducation, selectFullTime) => {
            this.setState({
              education: selectedEducation,
              fullTime: selectFullTime,
              educationVisible: false,
            })
          }}
        />
        <AlertContentModal
          visible={deleteVisible || giveUpSaveVisible}
          title="友情提示"
          detail={deleteVisible ? '确定删除这条项目经历吗？' : '内容尚未保存，确定放弃？'}
          bottomStyle={{ marginTop: 37 }}
          leftBtn={{
            title: '取消',
            act: () => this.setState({
              deleteVisible: false,
              giveUpSaveVisible: false
            }),
          }}
          rightBtn={{
            title: deleteVisible ? '删除' : '退出',
            act: () => {
              if (deleteVisible) {
                // 删除操作
                this.setState({ deleteVisible: false }, () => {
                  // 缺少删除接口
                  this.removeEduExperience()
                })
              } else {
                // 退出操作
                this.setState({ giveUpSaveVisible: false }, () => {
                  navigation.pop()
                })
              }
            },
          }}
        />
      </View>
    )
  }
}