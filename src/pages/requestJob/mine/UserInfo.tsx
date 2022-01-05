import React, { Component } from 'react'
import { Text, View, Image, ScrollView, StatusBar } from 'react-native'
import styles from './styles/UserInfo.style'
import { GenProps } from '../../../navigator/requestJob/stack'
import NavBar, { EButtonType } from '../../components/NavBar'
import NextTouchableOpacity from '../../components/NextTouchableOpacity'
import GradientButton from '../../components/GradientButton'
import { IStoreState } from '../../../reducer'
import { bindActionCreators, Dispatch, AnyAction } from 'redux'
import { connect } from 'react-redux'
import { loginAction } from '../../../action'
import { EducationType, reformEducation, selectEducation } from '../../../utils/utils'
import ActionSheet from '../../../recruitment/components/ActionSheet'
import DatePickerModal from '../../components/DatePickerModal'
import RootLoading from '../../../utils/rootLoading'

type IProps = GenProps<'UserInfo'> &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>

interface IState {
  dataSource: any,
  selectGender: boolean,
  genderActionVisible: boolean,
  datePickVisible: boolean
  localDateOfBirth: any,
  userName: string
  phoneNumber: string
  education: any
  first_time_working: any
  first_time_working_pick: boolean
  localDateOfWorking: any,
  current_city: string,
  logo: string,
}

const listData = [
  {
    id: 1,
    title: '散播违法/敏感言论',
    description: '招聘者发布的信息包含违法、政治敏感内容'
  }, {
    id: 2,
    title: '人身攻击',
    description: '招聘者存在辱骂、骚扰等语言或肢体上的不当行为'
  }, {
    id: 3,
    title: '色情骚扰',
    description: '招聘者发布的信息包含色情低俗内容或存在性骚扰行为'
  }, {
    id: 4,
    title: '职位虚假',
    description: '招聘者发布的职位信息与实际沟通职位不符'
  }, {
    id: 5,
    title: '招聘者身份虚假',
    description: '招聘者不是其认证公司的员工'
  }, {
    id: 6,
    title: '收取求职者费用',
    description: '招聘者以各种名义或变相收取求职者费用'
  }, {
    id: 7,
    title: '违法/欺诈行为',
    description: '招聘者存在引诱求职者从事不法活动或欺诈求职者'
  }, {
    id: 8,
    title: '其他违规行为',
    description: '招聘者或公司存在以上列举类型之外的违规行为'
  }
]

class UserInfo extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    const { userInfo: { gender, birth_date, username, phone_number, education, first_time_working, current_city, logo } } = props
    this.state = {
      dataSource: listData,
      selectGender: gender || true,
      genderActionVisible: false,
      datePickVisible: false,
      localDateOfBirth: birth_date || new Date(),
      userName: username || '',
      phoneNumber: phone_number || '',
      education: education || '',
      first_time_working: first_time_working || '',
      first_time_working_pick: false,
      localDateOfWorking: first_time_working || new Date(),
      current_city: current_city || '',
      logo: logo || ''
    }
  }

  renderNavBar() {
    const { navigation } = this.props
    return (
      <NavBar
        statusBarTheme="dark-content"
        barStyle={{
          borderBottomWidth: 0,
          elevation: 0,
        }}
        title="个人信息"
        left={{
          type: EButtonType.IMAGE,
          value: require('../../../assets/black_back.png'),
          act: () => {
            navigation.pop()
          },
        }}
      />
    )
  }

  renderIcon() {
    const { userInfo } = this.props
    return (
      <View style={styles.iconView}>
        <Text style={styles.iconText}>头像</Text>
        <Image
          source={userInfo.logo ? { uri: userInfo.logo } : require('../../../assets/requestJobs/icon-example.png')}
          style={styles.iconStyle}
        />
      </View>
    )
  }

  renderCell(title: string, detail: string, arrow: boolean, onPress?: () => void) {
    return (
      <NextTouchableOpacity
        style={styles.cell}
        onPress={() => {
          if (onPress) {
            onPress()
          }
        }}
      >
        <Text style={styles.cellText}>{title}</Text>
        <View style={styles.valueView}>
          <Text style={styles.cellDetail}>{detail}</Text>
          {arrow && (
            <Image
              style={styles.nextIcon}
              source={require('../../../assets/requestJobs/next-gray.png')}
            />
          )}
        </View>
      </NextTouchableOpacity>
    )
  }

  renderGender() {
    const { selectGender } = this.state
    return (
      <View style={styles.genderView}>
        <Text style={styles.genderText}>性别</Text>
        <View style={styles.genderDetail}>
          <NextTouchableOpacity
            onPress={() => {
              this.setState({ selectGender: true })
            }}
            style={[
              styles.genderDetailBtn,
              selectGender && {
                backgroundColor: '#E9FFF0',
                borderColor: '#7AD398'
              }
            ]}
          >
            <Text style={[styles.genderDetailText,
            selectGender && {
              fontWeight: 'bold',
              color: '#7AD398'
            }
            ]}>男</Text>
          </NextTouchableOpacity>
          <NextTouchableOpacity
            onPress={() => {
              this.setState({ selectGender: false })
            }}
            style={[
              styles.genderDetailBtn,
              !selectGender && {
                backgroundColor: '#E9FFF0',
                borderColor: '#7AD398'
              }
            ]}
          >
            <Text style={[styles.genderDetailText,
            !selectGender && {
              fontWeight: 'bold',
              color: '#7AD398'
            }
            ]}>女</Text>
          </NextTouchableOpacity>
        </View>
      </View>
    )
  }

  saveInfo() {
    const { setUserEditBasicInfo, userInfo } = this.props
    console.log('userInfo: ', userInfo)
    const {
      logo,
      userName,
      localDateOfBirth,
      selectGender,
      current_city,
      education,
      first_time_working
    } = this.state
    const info: any = {
      username: userName,
      birthday: localDateOfBirth,
      gender: !!selectGender,
      currentCity: current_city,
      education,
      firstTimeWorking: first_time_working
    }
    if (logo) {
      info.logo = logo
    }
    console.log('info: ', info)
    RootLoading.loading('正在加载中...')
    setUserEditBasicInfo(info, (error, result) => {
      console.log('editInfo: ', error, result)
      if (!error) {
        RootLoading.success('修改成功')
      }
    })
  }

  renderSaveBtn() {
    return (
      <View
        style={styles.bottomContainer}
      >
        <GradientButton
          text="保存"
          containerStyle={styles.btnContainer}
          onPress={() => {
            this.saveInfo()
          }}
        />
      </View>
    )
  }

  render() {
    const { userInfo, navigation } = this.props
    const { genderActionVisible, datePickVisible, localDateOfBirth, userName, localDateOfWorking, current_city,
      phoneNumber, education, first_time_working, first_time_working_pick } = this.state
    console.log('userInfo: ', userInfo)
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
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {this.renderIcon()}
          {this.renderCell('姓名', userName, true, () => {
            navigation.push('UserInfoEdit', {
              title: '姓名', inputCallback: (value) => {
                this.setState({ userName: value })
              }
            })
          })}
          {this.renderCell('出生日期', localDateOfBirth, true, () => {
            this.setState({ datePickVisible: true })
          })}
          {this.renderGender()}
          {this.renderCell('所在城市', current_city, true, () => {
            navigation.push('JobSelectCity', {
              selectJobCityCallback: (value) => {
                console.log('value: ', value)
                const showValue = value.indexOf('市辖区') > -1 ? value.split(' ')[0] : `${value.split(' ')[0]}${value.split(' ').length > 1 ? `-${value.split(' ')[1]}` : ''}`
                this.setState({
                  // 设置城市
                  current_city: showValue
                })
              },
              mode: 1
            })
          })}
          {this.renderCell('手机号码', phoneNumber, true, () => {
            navigation.push('UserInfoEdit', {
              title: '手机号码', inputCallback: (value) => {
                this.setState({ phoneNumber: value })
              }
            })
          })}
          {this.renderCell('您的学历', selectEducation(education), true, () => {
            this.setState({ genderActionVisible: true })
          })}
          {this.renderCell('首次参加工作时间', localDateOfWorking, true, () => {
            this.setState({ first_time_working_pick: true })
          })}
        </ScrollView>
        {this.renderSaveBtn()}
        <ActionSheet
          visible={genderActionVisible}
          onDismiss={() => this.setState({ genderActionVisible: false })}
          actions={[
            { title: '无', onPress: () => this.setState({ education: 'LessThanPrime' }) },
            { title: '小学', onPress: () => this.setState({ education: 'Primary' }) },
            { title: '初中', onPress: () => this.setState({ education: 'Junior' }) },
            { title: '高中', onPress: () => this.setState({ education: 'High' }) },
            { title: '大专', onPress: () => this.setState({ education: 'JuniorCollege' }) },
            { title: '本科', onPress: () => this.setState({ education: 'RegularCollege' }) },
            { title: '研究生', onPress: () => this.setState({ education: 'Postgraduate' }) },
            { title: '博士', onPress: () => this.setState({ education: 'Doctor' }) }
          ]}
        />
        <DatePickerModal
          visible={datePickVisible}
          currentDate={new Date(Date.parse(localDateOfBirth))}
          leftPress={() => {
            this.setState({ datePickVisible: false })
          }}
          rightPress={(newDate) => {
            this.setState({
              // localDateOfBirth: `${newDate.getFullYear()}-${newDate.getMonth()}-${newDate.getDay()}`,
              localDateOfBirth: newDate.toISOString().split('T')[0],
              datePickVisible: false,
            })
          }}
        />
        <DatePickerModal
          visible={first_time_working_pick}
          currentDate={new Date(Date.parse(localDateOfWorking))}
          leftPress={() => {
            this.setState({ first_time_working_pick: false })
          }}
          rightPress={(newDate) => {
            this.setState({
              localDateOfWorking: newDate.toISOString().split('T')[0],
              first_time_working_pick: false,
            })
          }}
        />
      </View>
    )
  }
}

const mapStateToProps = (state: IStoreState) => {
  return {
    userInfo: state.userInfo.userInfo,
  }
}

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return bindActionCreators(
    {
      setUserEditBasicInfo: loginAction.setUserEditBasicInfo
    },
    dispatch
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(UserInfo)