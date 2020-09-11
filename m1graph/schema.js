const typeDefs = `
scalar JSON
scalar ID
scalar Date
type Feed {
  id:String!
  name:String
  type: FeedType
  graphql:GraphqlConfig,
  graphdb:GraphdbConfig,
  nosql:NosqlConfig,
  sql:SqlConfig,
  api:ApiConfig,
  websocket:WebsocketConfig
}

enum FeedType {
  API
  GRAPHDB
  GRAPHQL
  NOSQLDB
  SQLDB
  WEBSOCKET
}

type Vertex {
  id:String!
  label:String
  type:String
  properties:JSON
 
}
input VertexInput {
  id:String
  sourceId:String
  label:String
  name:String
  type:String
  properties:JSON
}

type Edge {
  id:String!
  inV:String
  inVLabel:String
  label:String
  outV:String
  outVLabel:String
  type:String
  properties:JSON
}

type GraphqlConfig {
  endpoint:String
}

type GraphdbConfig {
  endpoint:String
  primaryKey:String
  database:String
  collection:String
}
type NosqlConfig {
  endpoint:String
  key:String
}
type ApiConfig {
  apiEndpoint:String
  apiKey:String
  headers:String
  credentials:String
}


type SqlConfig {
  user:String
  password:String
  server:String
  port:Int
  database:String
  requestTimeout:Int
}
type WebsocketConfig {
  endpoint:String
}

type JWToken {
  access_token:String
  expires_in:String
  refresh_token:String
}

type Well {
  id:String
  api:String
  hasOwner:Boolean
  isTracked:Boolean
  operator:String
  latitude:Float
  longitude:Float
  permitApprovedDate:Int
  permitNumber:String
  measuredDepth:Float
  lateralLength:Float
  trueVerticalDepth:Float
  spudDate:Int
  completionDate:Int,
  daysSinceCompletion:Int
  daysSinceDrilled:Int
  firstProductionDate:Int
  wellTypeId:String
  wellType:String
  wellStatusId:String
  wellStatus: String
  wellBoreProfileId:String
  wellBoreProfile:String
  boeTotal:String
  interestTypeRoyaltyInterest:Boolean
  interestTypeOverrideRoyalty:Boolean
  interestTypeWorkingInterest:Boolean
  interestTypeProductionPayment:Boolean
  state:String
  county:String
  basin:String
  play:String
  cumulativeOil:Float
  cumulativeGas:Float
  cumulativeWater:Float
  firstMonthOil:Float
  firstMonthGas:Float
  firstMonthWater:Float
  firstThreeMonthOil:Float
  firstThreeMonthGas:Float
  firstThreeMonthWater:Float
  firstSixMonthOil:Float
  firstSixMonthGas:Float
  firstSixMonthWater:Float
  firstTwelveMonthOil:Float
  firstTwelveMonthGas:Float
  firstTwelveMonthWater:Float
  lastMonthOil:Float
  lastMonthGas:Float
  lastMonthWater:Float
  lastThreeMonthOil:Float
  lastThreeMonthGas:Float
  lastThreeMonthWater:Float
  lastSixMonthOil:Float
  lastSixMonthGas:Float
  lastSixMonthWater:Float
  lastTwelveMonthOil:Float
  lastTwelveMonthGas:Float
  lastTwelveMonthWater:Float
  ownershipTypeReligiousInstitutions:Boolean
  ownershipTypeGovernmentalBodies:Boolean
  ownershipTypeNonProfits:Boolean
  ownershipTypeTrusts:Boolean
  ownershipTypeCorporations:Boolean
  ownershipTypeEducationalInstitutions:Boolean
  ownershipTypeIndividuals:Boolean
  ownershipTypeUnknown:Boolean
  lastTwelveMonthBOE:Float
  ownerCount:Int
  valuation:Int
  taxAppraisalNumber:String
  wellName:String
  survey:String
  abstract:String
  block:String
  section:String
  leaseId:String
  stateWellId:String
  dateCataloged:String
  ipGas:Float
  ipOil:Float
  ipWater:Float
  hasLine:Boolean
}

type WellsRanges {
  permitDate: String
  spudDate: String
  completionDate: String
  firstProdDate: String
  cumulativeOil: Float
  cumulativeGas: Float
  cumulativeWater: Float
  firstMonthProdOil: Float
  firstMonthProdGas: Float
  firstMonthProdWater: Float
  first3MonthProdOil: Float
  first3MonthProdGas: Float
  first3MonthProdWater: Float
  first6MonthProdOil: Float
  first6MonthProdGas: Float
  first6MonthProdWater: Float
  first12MonthProdOil: Float
  first12MonthProdGas: Float
  first12MonthProdWater: Float
  lastMonthProdOil: Float
  lastMonthProdGas: Float
  lastMonthProdWater: Float
  last6MonthProdOil: Float
  last6MonthProdGas: Float
  last6MonthProdWater: Float
  last12MonthProdOil: Float
  last12MonthProdGas: Float
  last12MonthProdWater: Float
}

type Map {
  id:String!
  name:String
  styleId:String
  centerLocation:Location
  tilesets:[Tileset]
}

type Tileset {
  id:String!
  name:String
  mapboxTilesetId:String
}

type Location {
  id:String!
  latitude:Float
  longitude:Float
  address:String
}

type Track {
  _id:String
  ts:String
  user:String
  objectType: String
  trackOn:String
}

input TrackInput {
  user:String
  objectType: String
  trackOn:String
}

type TrackUpsertResponse {
  success: Boolean!
  message: String
  track: Track
  error: String
}

type TrackRemoveResponse {
  success: Boolean!
  message: String
  error: String
}

type TrackToggleResponse {
  success: Boolean!
  tracking: Boolean!
  error: String
}

type Tag {
  _id:String
  tag:String
  ts:String
  public: Boolean
  user:User
  taggedOn:String
  objectType: String
}
input TagInput {
  tag:String
  public: Boolean
  user:String
  taggedOn:String
  objectType: String
}

type TagUpsertResponse {
  success: Boolean!
  message: String
  tag: Tag
  error: String
}

type TagRemoveResponse {
  success: Boolean!
  message: String
  error: String
}

type Comment {
  _id:String
  comment:String
  ts:String
  public: Boolean
  user:User
  commentedOn:String
  objectType: String
}
input CommentInput {
  comment:String
  public: Boolean
  user:String
  commentedOn:String
  objectType: String
}
type CommentUpsertResponse {
  success: Boolean!
  message: String
  comment: Comment
  error: String
}
type CommentRemoveResponse {
  success: Boolean!
  message: String
  error: String
}

type ParcelOwner {
  _id: String
  ownerEntityId: String
  name: String
  address1: String
  address2: String
  city: String
  state: String
  zip: String
  country: String
  globalOwner: String
  entity: String
  type: String
  depthFrom: String
  depthTo: String
  interest: String
  nma: String
  nra: String
  customLayer: String
  IsDeleted: Boolean
  isContact: String
}
input ParcelOwnerInput {
  _id: String
  ownerEntityId: String
  name: String
  address1: String
  address2: String
  city: String
  state: String
  zip: String
  country: String
  globalOwner: String
  entity: String
  type: String
  depthFrom: String
  depthTo: String
  interest: String
  nma: String
  nra: String
  customLayer: String
  IsDeleted: Boolean
}
type ParcelOwnerResponse {
  success: Boolean!
  message: String
  owner: ParcelOwner
  error: String
}

type ParcelInterest {
  _id: String
  entity: String
  type: String
  depthFrom: String
  depthTo: String
  interest: String
  nma: String
  nra: String
  customLayer: String
  ownerEntity: String
  IsDeleted: Boolean

  shape: String
  name: String
  layer: String
  user: User
  county: String
  state: String
  Grid1: String
  Grid2: String
  Grid3: String
  Grid4: String
  Grid5: String
  qtrQtr: JSON
  grossAcres: String
  calcAcres: String
  legalDescription: String 
}
input ParcelInterestInput {
  _id: String
  entity: String
  type: String
  depthFrom: String
  depthTo: String
  interest: String
  nma: String
  nra: String
  customLayer: String
  ownerEntity: String
  IsDeleted: Boolean

  shape: String
  name: String
  layer: String
  user: String
  county: String
  state: String
  Grid1: String
  Grid2: String
  Grid3: String
  Grid4: String
  Grid5: String
  qtrQtr: JSON
  grossAcres: String
  calcAcres: String
  legalDescription: String 
}
type ParcelInterestResponse {
  success: Boolean!
  message: String
  parcelInterest: ParcelInterest
  error: String
}

type ParcelOwnership {
  _id: String
  entity: String
  type: String
  depthFrom: String
  depthTo: String
  interest: String
  nma: String
  nra: String  
  customLayer: CustomLayer
  ownerEntity: String
  IsDeleted: Boolean
}
input ParcelOwnershipInput {
  _id: String
  entity: String
  type: String
  depthFrom: String
  depthTo: String
  interest: String
  nma: String
  nra: String
  customLayer: String
  ownerEntity: String
  IsDeleted: Boolean
}
type ParcelOwnershipResponse {
  success: Boolean!
  message: String
  parcelOwnership: ParcelOwnership
  error: String
}

type CustomLayer {
  _id: String
  shape: String
  name: String
  layer: String
  user: User 
  county: String
  state: String
  Grid1: String
  Grid2: String
  Grid3: String
  Grid4: String
  Grid5: String
  qtrQtr: JSON
  grossAcres: String
  calcAcres: String
  legalDescription: String 
  owners: [ParcelOwner]
}
input CustomLayerInput {
  shape: String
  name: String
  layer: String
  user: String
  county: String
  state: String
  Grid1: String
  Grid2: String
  Grid3: String
  Grid4: String
  Grid5: String
  qtrQtr: JSON
  grossAcres: String
  calcAcres: String
  legalDescription: String 
}
type CustomLayerResponse {
  success: Boolean!
  message: String
  customLayer: CustomLayer
  error: String
}
type CustomLayerRemoveResponse {
  success: Boolean!
  message: String
  error: String
}

type File {
  _id : String
  name : String
  contentType : String
  containerName : String
}

type FileLayer {
  _id: String
  layerName: String
  idColor: String
  layerType: String
  paintProps: JSON
  file: File
  user: User
}
input FileLayerInput {
  layerName: String
  idColor: String
  layerType: String
  paintProps: JSON
  file: String
  user: String
}
type FileLayerResponse {
  success: Boolean!
  message: String
  fileLayer: FileLayer
  error: String
}
type FileLayerRemoveResponse {
  success: Boolean!
  message: String
  error: String
}

type Operator {
  Name: String
}
type User{
  _id:String
  email:String
  name: String
  ts: String
}

input UserInput {
  email:String
  name: String
}
type UserResponse {
  success:Boolean
  message:String
  user: User
}

type UserFindOrCreateResponse {
  success: Boolean!
  message: String
  user: User
}

type Profile{
  _id:String
  email:String
  fullname: String
  displayname: String
  activity: String
  phone: String
  timezone: String
  profileImage: String
  ts: String
  outlook_integrated: Boolean
}

input ProfileInput {
  email:String
  fullname: String
  displayname: String
  activity: String
  phone: String
  timezone: String
  profileImage: String
  outlook_integrated: Boolean
}

type UpsertProfileResponse {
  success: Boolean!
  message: String
}

type ProfileResponse {
  success: Boolean
  profile: Profile
}

type Tenant {
  id:String!
  tenant: String,
  graphQL:JSON,
  cosmosGraphDB:JSON,
  cosmosDB:JSON
}
input TenantInput {
  id:String!
  name: String
}

type Filter {
  id:String!
  name:String
  filterArray:String
}
type Drawing {
  id:String!
  name:String
  drawing:String
  url:String
}
type Permit {
  id:String!
  name:String
  permit:String
  url:String
}
type Project {
  id:String!
  name:String
}
type Document {
  id:String!
  name:String
  url:String
}

type Owner {
  id: String
  name: String
  ownerType: String
  ownershipType:String
  interestType:String
  ownershipPercentage: Float
  appraisedValue: Float
  isTracked: Boolean
  
}

type WellOwner {
  id: String
  name: String
  ownerType: String
  ownershipType:String
  interestType:String
  ownershipPercentage: Float
  appraisedValue: Float
  isTracked: Boolean
}

type Phone {
  countryCode:String
  type:String
  number:String
}
type Address {
  fullAddress:String
  address1:String
  address2:String
  city:String
  stateProvince:String
  postalCode:String
  country:String
}

type Quadrant {
  quadrant:Int
  metric:String
  units:String
  value1:Float
  value6:Float
  value12:Float
  cumulative:Float
}

type WellProdHistory {
  year: String
  month: Int
  reportDate: String
  gas: Float
  oil: Float
  water: Float
}

type v2eResponse {
  success: Boolean!
  message: String
  source: Vertex
  target: Vertex
  edge: Edge
}

type vertextEdgesResponse {
  success: Boolean!
  message: String
  sourceIds: [String]
}

type dropVertexResponse {
  success: Boolean!
  message: String
}
type dropEdgeResponse {
  success: Boolean!
  message: String
}
type OwnersResponse {
  success: Boolean!
  message: String
  results:[Owner]
}
type WellsResponse {
  success: Boolean!
  message: String
  results:[Well]
}

type County {
  county:String
  state:String
}
type Survey {
  survey:String
  county:String
}
type Abstract {
  abstract:String
  survey:String
}

type TitleOpinion {
  id:String
  legalDescription:String
  preparedBy:String
  certifiedDate:String
  state:String
  county:String
  project:String
  client:String
  generalNotes:String
  MORSections: JSON
  RunSheetSections:JSON
}
input SendEmailContactInput {
  name:String
  email:String
  category:String
  comment:String
}

input SendEmailBugInput {
  issue:String
  description:String
}

input TitleOpinionInput {
  id:String
  legalDescription:String
  preparedBy:String
  certifiedDate:String
  state:String
  county:String
  project:String
  client:String
  generalNotes:String
  MORSections: JSON
  RunSheetSections:JSON
}

type SendEmailResponse {
  success: Boolean!
  message: String
}

type TitleOpinionUpsertResponse {
  success: Boolean!
  message: String
  titleOpinion: TitleOpinion
}

type SearchHistory {
  _id:String
  searchData: JSON
  ts: String
  user:String
}

input SearchHistoryInput {
  searchData: JSON
  user:String
}

type SearchHistoryResponse {
  success: Boolean!
  message: String
  searchHistory: SearchHistory
  error: String
}

type AddFileResponse {
  id : String,
  uri : String,
  internalKey : String,
}

type ViewFileResponse {
  id : String,
  uri : String,
  internalKey : String,
}

type FileItemResponse {
  name : String,
  containerName : String,
  _id : String,
  internalKey : String,
}

type Transaction {
  _id:String
  allData:JSON
  user:String
}

input TransactionInput {
  allData:JSON
  user:String
}

type TransactionResponse {
  success: Boolean!
  message: String
  transaction: Transaction
  error: String
}

type ActivityLog {
  dateTime: String
  notes: String
  type: String
  user_id: String
  fullname: String
}

input ActivityLogInput {
  dateTime: String
  notes: String
  type: String
  user_id: String
  fullname: String
}

type Contact {
  _id:String
  entity: String
  name: String
  address1: String
  address2: String
  city: String
  country: String
  state: String
  zip: String
  globalOwner: String
  mobilePhone: String
  homePhone: String
  primaryEmail: String
  owners: [String]
  createAt: String
  createBy: User
  lastUpdateAt: String
  lastUpdateLeadStageAt: String
  lastUpdateBy: User
  address1Alt: String
  address2Alt: String
  cityAlt: String
  stateAlt: String
  zipAlt: String
  countryAlt: String
  AltPhone: String
  secondaryEmail: String
  relatives: String
  linkedln: String
  facebook: String
  twitter: String
  leadSource: String
  companyName: String
  jobTitle: String
  activityLog: [ActivityLog]
  leadStage: String
  IsDeleted: Boolean
}

input ContactInput {
  _id: String
  entity: String
  name: String
  address1: String
  address2: String
  city: String
  country: String
  state: String
  zip: String
  globalOwner: String
  mobilePhone: String
  homePhone: String
  primaryEmail: String
  owners: [String]
  createBy: String
  lastUpdateBy: String
  address1Alt: String
  address2Alt: String
  cityAlt: String
  stateAlt: String
  zipAlt: String
  countryAlt: String
  AltPhone: String
  secondaryEmail: String
  relatives: String
  linkedln: String
  facebook: String
  twitter: String
  leadSource: String
  companyName: String
  jobTitle: String
  activityLog: [ActivityLogInput]
  leadStage: String
  IsDeleted: Boolean
  lastUpdateLeadStageAt: String
}

type ContactResponse {
  success: Boolean!
  message: String
  contact: Contact
  error: String
}

type contactListResponse {
  success: Boolean!
  error: String
  message: String
}

type Message {
  _id: String
  user: String
  contact: String
  msgId: String
  contactEmail: String
  title: String
  message: String
  shortMsg: String
  sendRecv: Boolean
  archive: Boolean
  receivedAt: Date
}

input MessageInput {
  _id: String
  user: String
  contact: String
  msgId: String
  contactEmail: String
  title: String
  message: String
  shortMsg: String
  sendRecv: Boolean
  archive: Boolean
  receivedAt: Date
}

type UpsertMessageResponse {
  success: Boolean!
  message: String
  newMessage: Message
}

type AddBulkMessagesResponse {
  success: Boolean!
  error: String
  message: String
}

type LayerConfig {
  _id: String
  config: JSON
  layerName: String
  user: User
}

type LayerConfigResponse {
  success: Boolean!
  error: String
  message: String
  layerConfig: LayerConfig
}

type LayerConfigRemoveResponse {
  success: Boolean!
  error: String
  message: String
}

input LayerConfigInput {
  config: JSON
  layerName: String
  user: String
}

type LayersState {
  _id: String
  layersConfig: JSON
  user: User
}

type LayersStateResponse {
  success: Boolean!
  error: String
  message: String
  layerState: LayersState
}

type LayersStateRemoveResponse {
  success: Boolean!
  error: String
  message: String
}

input LayersStateInput {
  layersConfig: JSON
  user: String
}

enum GroupTypes {
  Unified
  DynamicMembership
}

enum Visibility {
  Private
  Public
  HiddenMembership
}

input GroupInput {
  displayName: String!
  groupTypes: [GroupTypes]
  description: String
  mailEnabled: Boolean!
  mailNickname: String!
  securityEnabled: Boolean!
  owners: [String]
  members: [String]
  visibility: Visibility
}

input Identity {
  signInType: String
  issuer: String
  issuerAssignedId: String
}

input PasswordProfile {
  forceChangePasswordNextSignIn: Boolean!,
  forceChangePasswordNextSignInWithMfa: Boolean,
  password: String!
}

input MSUserInput {
  accountEnabled: Boolean
  displayName: String!
  mail: String
  identities: [Identity]
  onPremisesImmutableId: String
  mailNickname: String
  passwordPolicies: String
  passwordProfile: PasswordProfile!
  extension_ecdc741a6b2c415893d3b5bccc2d7e76_mustResetPassword: Boolean
  userPrincipalName: String
}

type Mutation {
  addtSearchHistory(searchHistory:SearchHistoryInput):SearchHistoryResponse
  updateSearchHistory(searchId:ID): SearchHistoryResponse
  removeSearchHistory(searchId:ID): SearchHistoryResponse
  addContact(contact:ContactInput):ContactResponse
  updateContact(contact:ContactInput, ignoreResponse:Boolean):ContactResponse
  removeContact(contactId:ID): ContactResponse!
  addTransaction(transaction:TransactionInput):TransactionResponse
  updateTransaction(transactionId:ID, transaction:TransactionInput):TransactionResponse
  toggleCreateRemoveTrack(track:TrackInput): TrackToggleResponse!
  toggleCreateRemoveTracks(tracks:[TrackInput]): TrackToggleResponse!
  upsertTrack(track:TrackInput): TrackUpsertResponse!
  removeTrack(trackId:ID): TrackRemoveResponse!
  upsertTag(tag:TagInput): TagUpsertResponse!
  removeTag(tagId:ID): TagRemoveResponse!
  upsertComment(comment:CommentInput): CommentUpsertResponse!
  removeComment(commentId:ID): CommentRemoveResponse!
  upsertCustomLayer(customLayer:CustomLayerInput): CustomLayerResponse!
  removeCustomLayer(customLayerId:ID): CustomLayerRemoveResponse!
  updateCustomLayer(customLayerId:ID, customLayer:CustomLayerInput): CustomLayerResponse!
  upsertLayerConfig(layerConfig:LayerConfigInput): LayerConfigResponse!
  removeLayerConfig(layerConfigId:ID): LayerConfigRemoveResponse!
  updateLayerConfig(layerConfigId:ID, layerConfig:LayerConfigInput): LayerConfigResponse!
  upsertLayersState(layerState:LayersStateInput): LayersStateResponse!
  removeLayersState(userId:ID): LayersStateRemoveResponse!
  updateLayersState(userId:ID, layersState:LayersStateInput): LayersStateResponse!
  upsertFileLayer(fileLayer:FileLayerInput): FileLayerResponse!
  removeFileLayer(fileLayerId:ID): FileLayerRemoveResponse!
  updateFileLayer(fileLayerId:ID, fileLayer:FileLayerInput): FileLayerResponse!
  addOwnerToAParcel( parcelOwner: ParcelOwnerInput): ParcelOwnerResponse
  addParcelToAnEntity( parcelInterest: ParcelInterestInput): ParcelInterestResponse
  updateParcelOwnership( parcelOwnership: ParcelOwnershipInput): ParcelOwnershipResponse
  updateParcelOwner( parcelOwner: ParcelOwnerInput): ParcelOwnerResponse
  findOrCreateUser(user:UserInput):UserFindOrCreateResponse
  sendEmailContact(email:SendEmailContactInput): SendEmailResponse!
  sendEmailBug(email:SendEmailBugInput): SendEmailResponse!
  upsertTitleOpinion(titleOpinion:TitleOpinionInput): TitleOpinionUpsertResponse!
  v2e(source:VertexInput,target:VertexInput,relationshipLabel:String):v2eResponse!
  dropVertex(vertex:VertexInput):dropVertexResponse!
  dropEdge(source:VertexInput,target:VertexInput,relationshipLabel:String):dropEdgeResponse!
  upsertProfile(profile:ProfileInput):UpsertProfileResponse
  createBulkContacts(contactList: [ContactInput]):contactListResponse
  addFile(fileName:String, userId:ID):AddFileResponse!
  updateFile(fileId:ID, userId:ID):AddFileResponse!
  addMessage(message:MessageInput):UpsertMessageResponse
  updateMessage(message:MessageInput):UpsertMessageResponse
  addBulkMessages(messages:[MessageInput]):AddBulkMessagesResponse
  updateMelissaAddressRecord(melissaAddressRecord:JSON):JSON
  updateMelissaRecord(melissaRecord:JSON):JSON
  addUser(user:MSUserInput):JSON
  addGroup(group:GroupInput):JSON
  addGroupMembers(groupId:ID, userIds:[ID]):JSON
  removeUser(userId:ID):JSON
  removeGroup(groupId:ID):JSON
  removeGroupMembers(groupId:ID, userIds:[ID]):JSON
}


type Query {
  getGrId12345ForTXFromAbstract(fieldToSelect:String, county:String, whereFields:JSON ):JSON
  notifications(trackedWellID:[String]): [JSON]
  vertexEdges(source:VertexInput,edgeLabel:String,targetLabel:String):vertextEdgesResponse
  getSearchHistory(userId:ID ):[SearchHistory]
  WellGrId12345(gridNumber:Int, whereFields:JSON ):[JSON]
  wellsMinMaxLatLong( whereFields:JSON ):JSON
  wellsMinMaxLatLongFromIdsArray( idsArray:[String]):JSON
  basinShapes( names: [String] ):[JSON]
  basinNames:[JSON]
  permits( offset:Int, amount:Int ):[JSON]
  rigs( offset:Int, amount:Int ):[JSON]
  abstractGeo( polygon: String ):[JSON]
  abstractGeoContains( polygon: String ):[JSON]
  ownerLatsLonsArray(ownerId:ID):[JSON]
  operatorLatsLonsArray(operatorName:String):[JSON]
  leaseLatsLonsArray( fieldName: String, value: String ):[JSON]
  ownersWells(ownersIds:[String]):[JSON]
  ownerWells(ownerId:String):JSON
  counties(state:String):[County]
  surveys(county:String):[Survey]
  abstracts(survey:String):[Abstract]
  wells(wellIdArray:[String],authToken:String):WellsResponse
  tracksByObjectType(objectType:String):[Track]
  trackByObjectId(objectId:String):Track
  publicTags:[String]
  userAvailableTags(userId:ID):[String]
  userAvailableFilterTags(userId:ID):[String]
  tagsByObjectId(objectId:String):[Tag]
  tagsByObjectsIds(objectsIdsArray:[String],userId:ID):[JSON]
  tagSamples(objectsIdsArray:[String],userId:ID):[JSON]
  objectsFromTagsArray( objectType:String,tagsArray:[String], userId:ID ):[JSON]
  comments:[Comment]
  commentsByObjectId(objectId:String):[Comment]
  commentsByObjectsIds(objectsIdsArray:[String],userId:ID):[JSON]
  commentsCounter(objectsIdsArray:[String],userId:ID):[JSON]
  customLayers(userId:String):[CustomLayer]
  customLayer( id:ID): CustomLayer
  layerStateByUser( userId:String ):LayersState
  layersConfigByUser( userId:String ):[LayerConfig]
  allCustomLayers:[CustomLayer]
  fileLayers(userId:String):[FileLayer]
  fileLayer( id:ID): FileLayer
  allFileLayers:[FileLayer]
  well(wellId:String):Well
  wellsRanges(authToken:String):WellsRanges
  wellSummaryDetail(wellId:String):[JSON]
  wellOwners(wellId:String):[WellOwner] @cacheControl(maxAge: 31536000)
  wellsOwners(wellIdArray:[String]):[JSON]
  wellProdHistory(wellId:String):[WellProdHistory] @cacheControl(maxAge: 31536000)
  quadChart(wellId:String):[Quadrant] @cacheControl(maxAge: 31536000)
  owners(ownerIdArray:[String],authToken:String):OwnersResponse
  owner(id:String):Owner
  operators:[Operator] @cacheControl(maxAge: 31536000)
  userByEmail(userEmail:String):User
  titleOpinions:[TitleOpinion]
  transactionData(userId:ID):Transaction
  contacts:[Contact]
  contact(contactId:ID):Contact
  contactParcelInterests(contactId:ID):JSON
  profileByEmail(userEmail:String):ProfileResponse
  files(userId:ID): [FileItemResponse]
  viewFile (fileId : ID) : ViewFileResponse
  getPersonData(persons:[JSON]):JSON
  getMelissaRecords(contactId:ID):JSON
  getLastMelissaRecord(contactId:ID):JSON
  getMelissaRecordsCountForContactIds(objectsIdsArray:[String]):[JSON]
  messagesByContact(contactId:ID):[Message]
  messagesByUser(userId:ID):[Message]
  messagesByUserAndContact(userId:ID, contactId:ID):[Message]
  messagesByUserAndContactWithShort(userId:ID, contactId:ID):[Message]
  messagesByUserAndContactIncludeArchive(userId:ID, contactId:ID):[Message]
  allEntityNamesToAddAsParcelOwner( parcelId: ID):JSON
  allUsers:[JSON]
  allGroups:[JSON]
  userGroups(userId:ID):[JSON]
  groupUsers(groupId:ID):[JSON]
}`;

module.exports = typeDefs;
