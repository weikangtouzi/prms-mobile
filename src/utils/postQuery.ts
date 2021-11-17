import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
  split,
  ApolloLink,
  HttpLink,
} from "@apollo/client"
import { hostUri, wssUri } from "./config"
import { WebSocketLink, } from '@apollo/link-ws'
import { getMainDefinition } from '@apollo/client/utilities';

let apolloClientShare: ApolloClient<any>

const initApolloClient = (Authorization: string) => {
  console.log('Authorization: ', Authorization)
  const ws = new WebSocketLink({
    uri: wssUri,
    options: {
      reconnect: true,
      connectionParams: {
        Authorization: Authorization || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwidXNlcm5hbWUiOiLlhrflhagiLCJpZGVudGl0eSI6eyJyb2xlIjoiSFIiLCJpZGVudGl0eSI6IkVudGVycHJpc2VVc2VyIiwiZW50TmFtZSI6ImVudF8zIn0sImRlYWRUaW1lIjoiMTYzNzE2NTA0NDc3Mzg2NDAwMDAwIiwiaWF0IjoxNjM3MTY1MDQ0LCJleHAiOjE2MzcxNjg2NDR9.aMsmVczKlvyVu_9xHj7tT9TBrdBicDLmIx0IH-yNl3A',
      }
    },
  });

  const http = new HttpLink({
    uri: hostUri,
    headers: {
      Authorization: Authorization || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwidXNlcm5hbWUiOiLlhrflhagiLCJpZGVudGl0eSI6eyJyb2xlIjoiSFIiLCJpZGVudGl0eSI6IkVudGVycHJpc2VVc2VyIiwiZW50TmFtZSI6ImVudF8zIn0sImRlYWRUaW1lIjoiMTYzNzE2NTA0NDc3Mzg2NDAwMDAwIiwiaWF0IjoxNjM3MTY1MDQ0LCJleHAiOjE2MzcxNjg2NDR9.aMsmVczKlvyVu_9xHj7tT9TBrdBicDLmIx0IH-yNl3A',
    }
  })

  const newLink = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return def.kind === 'OperationDefinition' && def.operation === 'subscription';
    },
    ws,
    http,
  )
  apolloClientShare = new ApolloClient({
    // uri: hostUri,
    link: newLink,
    cache: new InMemoryCache(),
    // headers: {
    //   Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMiwidXNlcm5hbWUiOiLlhrflhagiLCJpZGVudGl0eSI6eyJyb2xlIjoiSFIiLCJpZGVudGl0eSI6IkVudGVycHJpc2VVc2VyIiwiZW50TmFtZSI6ImVudF8zIn0sImRlYWRUaW1lIjoiMTYzNzE2NTA0NDc3Mzg2NDAwMDAwIiwiaWF0IjoxNjM3MTY1MDQ0LCJleHAiOjE2MzcxNjg2NDR9.aMsmVczKlvyVu_9xHj7tT9TBrdBicDLmIx0IH-yNl3A'
    // }
  })
  return apolloClientShare
}

export const GET_ALL_COUNTRIES = gql`
  query getAllCountry {
    getAllCountry {
      name
      id
      countryCode
      currencyCode
    }
  }
`;

const sendSMSGql = gql`
  query StaticSendSms( $phoneNumber:String! ) {
    StaticSendSms(phoneNumber:$phoneNumber)
  }
`

const numberCheckGql = gql`
  query UserNumberCheck( $num:String! ) {
    UserNumberCheck(num:$num)
  }
  `

const testGql = gql`
  query rates($currency:String!) {
    rates(currency:$currency){
      currency
    }
  }
`

const loginGql = gql`
  query UserLogIn( $info:LogIn! ) {
    UserLogIn(info:$info) {
      username
      token
      createdAt
    }
  }
`

const registerGql = gql`
  query UserRegister( $info:Register! ) {
    UserRegister(info:$info)
  }
`

// 重置密码
const resetPasswordGql = gql`
  mutation UserResetPassword( $info:ResetPassword! ) {
    UserResetPassword(info:$info)
  }
`

// check 验证码
const checkUserVerifyCodeConsumeGql = gql`
  query UserVerifyCodeConsume( $info:VerifyInfo! ) {
    UserVerifyCodeConsume(info:$info)
  }
`

// subscription message
const subscriptionGqlServerGql = gql`
  subscription newMessage{
    newMessage{
      messageContent
    }
  }
`

// 选择身份
const chooseOrSwitchIdentityGql = gql`
  mutation UserChooseOrSwitchIdentity($targetIdentity:String!,$role:String!){
    UserChooseOrSwitchIdentity(targetIdentity:$targetIdentity,role:$role)
  }
`

const getUserEditPersonalDataGql = gql`
  mutation UserEditPersonalData($info:BasicData!){
    UserEditPersonalData(info:$info)
  }
`

const getENTEditEnterpriseBasicInfoGql = gql`
  mutation ENTEditEnterpriseBasicInfo ($info:EditEnterpriseBasicInfo!){
    ENTEditEnterpriseBasicInfo (info:$info)
  }
`

export {
  apolloClientShare,
  initApolloClient,
  sendSMSGql,
  loginGql,
  numberCheckGql,
  registerGql,
  getUserEditPersonalDataGql,
  getENTEditEnterpriseBasicInfoGql,
  resetPasswordGql,
  checkUserVerifyCodeConsumeGql,
  subscriptionGqlServerGql,
  testGql,
  chooseOrSwitchIdentityGql
}