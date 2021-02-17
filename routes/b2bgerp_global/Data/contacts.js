var moment = require('moment');
var express = require('express');
var router = express.Router();
var httpRequest = require('../../common/httpRequest');
var utils = require('../../common/utils');
const { param } = require('../../common/history');

var seq_cnt = 0;
/* Contacts */

//#region B2B GERP GLOBAL ENTITY 정의 함수 영역


function B2B_GERP_GLOBAL_ENTITY() {
  this.INTERFACE_ID = "ELOQUA_0003",
    this.LEAD_NAME = "";        //리드네임 [MQL]Subsidiary_BU_Platform&Activity_Register Date+Hour 값을 조합
  this.SITE_NAME = "";				//사이트네임
  this.LEAD_SOURCE_NAME = "";	//리드소스 네임 Platform&Activity 필드 매핑
  this.LEAD_SOURCE_TYPE = "11";//default 11 ? Eloqua에서 넘어오는 값이면 By Marketing, 영업인원이 수기입할 경우 By Sales로 지정
  this.ENTRY_TYPE = "L"       //default L
  this.ACCOUNT = "";          //회사
  this.CONTACT_POINT = "";    //Contact Point는 Eloqua 필드 중 -> Customer Name/Email/Phone No. 를 연결 시켜 매핑 필요
  this.CORPORATION = "";      //법인정보
  this.OWNER = "";            //데이터 없음
  this.ADDRESS = "";          //현업확인 Address1 + Address2 + Address3
  this.DESCRIPTION = "";      //설명 Comments, message, inquiry-to-buy-message 필드 중 하나
  this.ATTRIBUTE_1 = "";      //엘로코아 CONTACT ID
  this.ATTRIBUTE_2 = "";      //PRODUCT LV1의 BU 별 Budget
  this.ATTRIBUTE_3 = "";      //픽리스트 eloqua 확인
  this.ATTRIBUTE_4 = "";      //이메일
  this.ATTRIBUTE_5 = "";      //전화번호
  this.ATTRIBUTE_6 = "";      //확인필요
  this.ATTRIBUTE_7 = "";      //지역 - 국가 eloqua filed 정보
  this.ATTRIBUTE_8 = "";      //넷중 하나 또는 4개의 필드 정보 합 ( 확인 필요 )
  this.ATTRIBUTE_9 = "";      //Job Function
  this.ATTRIBUTE_10 = "";     //데이터 없음
  this.ATTRIBUTE_11 = "";     //사업부코드( 코드마스터 필요 ) 예) HE    LGE 앞자리 빼는지 확인 필요
  this.ATTRIBUTE_12 = "";     //Seniority
  this.ATTRIBUTE_13 = "";     //PRODUCT LV1의 BU 별 Needs
  this.ATTRIBUTE_14 = "";     //PRODUCT LV1의 BU 별 Timeline
  this.ATTRIBUTE_15 = "";     //Marketing Event
  this.ATTRIBUTE_16 = "";     //Privacy Policy YN
  this.ATTRIBUTE_17 = "";     //Privacy Policy Date
  this.ATTRIBUTE_18 = "";     //TransferOutside EEA YN
  this.ATTRIBUTE_19 = "";     //TransferOutside EEA Date
  this.ATTRIBUTE_20 = "";     //ELOQUA 내 Product 1
  this.ATTRIBUTE_21 = "";     //ELOQUA 내 Product 2 없을경우 NULL
  this.ATTRIBUTE_22 = "";     //ELOQUA 내 Product 3 없을경우 NULL
  this.ATTRIBUTE_23 = "";     //Vertical Type B2B GERP Global Code mapping
  this.REGISTER_DATE = "";    //어떤 날짜 정보인지 확인 필요
  this.TRANSFER_DATE = "";    //어떤 날짜 정보인지 확인 필요
  this.TRANSFER_FLAG = "";		//TRANSFER_FLAG N , Y 값의 용도 확인 필요 
  this.LAST_UPDATE_DATE = "";
  //Building Type을 Vertical Type으로 변경하고 전사 Vertical 기준에 맞추어 매핑 필요 - LG.com내에도 항목 수정 필요하니 요청 필요함 호텔정보 
}

//#endregion

//#region Functions

function GetCustomFiledValue(contacts_customfields, customfieldID) {

  var result_data = "";

  for (var fieled_index in contacts_customfields) {
    var fieldValue_id = contacts_customfields[fieled_index].id;
    var fieldValue_value = contacts_customfields[fieled_index].value;

    if (fieldValue_id == customfieldID) {
      if (fieldValue_value != undefined) {
        result_data = fieldValue_value;
        break;
      }
      else {
        result_data = "";
        break;
      }
    }
  }
  return result_data;
}

function setCustomFieldValue (custom_id , custom_value){
  return { 
    "id": custom_id , 
    "value": custom_value
  }
}

function GetDataValue(contacts_fieldvalue) {
  try {
    if (contacts_fieldvalue != undefined) {
      return contacts_fieldvalue;
    }
    else {
      return "";
    }
  }
  catch (e) {
    console.log(e);
    return "";
  }
}

function GetConvertVerticalType1Code(_Business_Sector_Name) {
  // 코드	값
  // 01	4. Corporate (Office/Work Spaces)
  // 02	6. Education
  // 03	9. Factory
  // 04	8. Government Department
  // 05	2. Hospitality
  // 08	7. Public Facility
  // 09	1. Retail
  // 10	11. Special Purpose
  // 11	5. Transportation
  // 15	3. Residential (Home)
  // 16	10. Power plant/Renewable energy

  var result = "";
  switch (_Business_Sector_Name) {
    case "Corporate":
      result = "01";
      break;
    case "Education":
      result = "02";
      break;
    case "Factory":
      result = "03";
      break;
    case "Government Department":
      result = "04";
      break;
    case "Hospitality":
      result = "05";
      break;
    case "Public Facility": //Eloqua value값 추가 필요
      result = "08";
      break;
    case "Retail":
      result = "09";
      break;
    case "Special purpose": //Eloqua value값 추가 필요
      result = "10";
      break;
    case "Transportation":
      result = "11";
      break;
    case "Residential":  //Eloqua valuer값 추가 필요
      result = "15";
      break;
    //case "Power plant / Renewable energy":  //Eloqua valuer값 추가 필요
    case "Power plant":  //Eloqua valuer값 추가 필요
      result = "16";
      break;
  }
  return result;
}

function GetConvertVerticalType2Code(_Business_Sector_Name, _Business_Sector_Vertival2_Name) {
  // 코드	값
  // 0910	1-1. Restaurant / F&B / QSR
  // 0914	1-2. Specialty store
  // 0907	1-3. Hyper market & grocery
  // 0911	1-4. Shopping mall
  // 0913	1-5. Other Stores
  // 0503	2-1. Hotel / Resort / Casino
  // 0501	2-2. Cruise
  // 0502	2-3. Hospital
  // 0504	2-4. LTC (Long-Term Care)
  // 0508	2-5. Dormitory
  // 0509	2-6. Fitness
  // 0507	2-7. Others
  // 1501	3-1. Apartment
  // 1502	3-2. Officetel
  // 1503	3-3. Townhouse
  // 1504	3-4. Villa / Single-Family Home
  // 1505	3-5. Others
  // 0113	4-1. Office
  // 0114	4-2. Conference/Meeting Room/Collaboration spaces
  // 0115	4-3. Auditorium
  // 0116	4-4. Control/Command room
  // 0106	4-5. Broadcasting/Studio
  // 0117	4-6. Traning/Experience center
  // 0118	4-7. Show room/Briefing center
  // 0119	4-8. Common spaces 
  // 0120	4-9. Client interaction venue/space﻿
  // 0121	4-10. Others
  // 1101	5-1. Air Transport
  // 1104	5-2. Road
  // 1103	5-3. Railway & Metro
  // 1102	5-4. Sea
  // 1105	5-5. Others
  // 0201	6-1. K12 (Kindergarten & Schools)
  // 0202	6-2. HigherEd (College & University)
  // 0205	6-3. Institute & Academy
  // 0204	6-4. Others
  // 0816	7-1. Culture
  // 0813	7-2. Sports
  // 0817	7-3. Religious facility
  // 0818	7-4. Outdoor Advertisement
  // 0815	7-5. Others
  // 0403	8-1. General Government Office
  // 0404	8-2. Military
  // 0406	8-3. Police/Fire station
  // 0402	8-4. Welfare facilities 
  // 0410	8-5. Others
  // 0309	9-1. Manufacturing factory
  // 0310	9-2. Chemical factory
  // 0311	9-3. Pharmaceutical factory
  // 0301	9-4. Others
  // 1601	10-1. Power plant
  // 1602	10-2. Renewable energy
  // 1603	10-3. Energy Storage & Saving
  // 1604	10-4. Others
  // 1011	11-1. Mixed-use (Multi Complex)
  // 1009	11-2. Botanical Garden / Green House
  // 1005	11-3.Telecom base station / Data, Call center
  // 1010	11-4. Others

  var result = "";
  switch (GetConvertVerticalType1Code(_Business_Sector_Name)) {
    case "09":
      switch (_Business_Sector_Vertival2_Name) {
        case "Restaurant / F&B / QSR":
          result = "0910"; break;

        case "Specialty store":
          result = "0914"; break;

        case "Hyper market & grocery":
          result = "0907"; break;

        case "Shopping mall":
          result = "0911"; break;

        case "Other Stores":
          result = "0913"; break;
      }
      break;

    case "05":
      switch (_Business_Sector_Vertival2_Name) {
        case "Hotel / Resort / Casino":
          result = "0503"; break;

        case "Cruise":
          result = "0501"; break;

        case "Hospital":
          result = "0502"; break;

        case "LTC (Long-Term Care)":
          result = "0504"; break;

        case "Dormitory":
          result = "0508"; break;

        case "Fitness":
          result = "0509"; break;

        case "Others":
          result = "0507"; break;
      }
      break;

    case "15":
      switch (_Business_Sector_Vertival2_Name) {
        case "Apartment": 
        result = "1501"; break;

        case "Officetel": 
        result = "1502"; break;

        case "Townhouse":
        result = "1503"; break;

        case "Villa / Single-Family Home":
        result = "1504"; break;

        case "Others":
        result = "1505"; break;
      }
      break;

    case "01":
      switch (_Business_Sector_Vertival2_Name) {
        case "Office": 
          result = "0113"; break;

        case "Conference/Meeting Room/Collaboration spaces":
          result = "0114"; break;

        case "Auditorium":
          result = "0115"; break;

        case "Control/Command room":
          result = "0116"; break;

        case "Broadcasting/Studio":
          result = "0106"; break;

        case "Traning/Experience center":
          result = "0117"; break;

        case "Show room/Briefing center":
          result = "0118"; break;

        case "Common spaces ":
          result = "0119"; break;

        case "Client interaction venue/space":
           result = "0120"; break;

        case "Others":
          result = "0121"; break;
      }
      break;

    case "11":
      switch (_Business_Sector_Vertival2_Name) {
        case "Air Transport":
          result = "1101"; break;

        case "Road":
          result = "1104"; break;

        case "Railway & Metro":
          result = "1103"; break;

        case "Sea":
          result = "1102"; break;

        case "Others":
          result = "1105"; break;
      }
      break;

    case "02":
      switch (_Business_Sector_Vertival2_Name) {
        case "K12 (Kindergarten & Schools)":
          result = "0201"; break;

        case "HigherEd (College & University)":
          result = "0202"; break;

        case "Institute & Academy":
          result = "0205"; break;

        case "Others":
          result = "0204"; break;
      }
      break;

    case "08":
      switch (_Business_Sector_Vertival2_Name) {
        case "Culture":
          result = "0816"; break;

        case "Sports":
          result = "0813"; break;

        case "Religious facility":
          result = "0817"; break;

        case "Outdoor Advertisement":
          result = "0818"; break;

        case "Others":
          result = "0815"; break;
      }
      break;

    case "04":
      switch (_Business_Sector_Vertival2_Name) {
        case "General Government Office":
          result = "0403"; break;

        case "Military":
          result = "0404"; break;

        case "Police/Fire station":
          result = "0406"; break;

        case "Welfare facilities ":
          result = "0402"; break;

        case "Others":
          result = "0410"; break;
      }
      break;

    case "03":
      switch (_Business_Sector_Vertival2_Name) {
        case "Manufacturing factory":
          result = "0309"; break;

        case "Chemical factory":
          result = "0310"; break;

        case "Pharmaceutical factory":
          result = "0311"; break;

        case "Others":
          result = "0301"; break;
      }
      break;

    case "16":
      switch (_Business_Sector_Vertival2_Name) {
        case "Power plant":
          result = "1601"; break;

        case "Renewable energy":
          result = "1602"; break;

        case "Energy Storage & Saving":
          result = "1603"; break;

        case "Others":
          result = "1604"; break;
      }
      break;

    case "10":
      switch (_Business_Sector_Vertival2_Name) {
        case "Mixed-use (Multi Complex)":
          result = "1011"; break;

        case "Botanical Garden / Green House":
          result = "1009"; break;

        case "Telecom base station / Data, Call center":
          result = "1005"; break;

        case "Others":
          result = "1010"; break;
      }
      break;
  }
  return result;
}

//business_department ( AS , CLS , CM , ID , IT , Solar , Solution )
//key ( Job Function , Business Unit , Seniority , Needs , TimeLine )
function GetBusiness_Department_data(fieldValues, business_department, key) {

  var result_data = "";
  switch (business_department) {
    case "AS":
      switch (key) {
        case "Job Function":
          //100323	AS_Authority2(Job Function)
          result_data = GetCustomFiledValue(fieldValues, 100323);
          break;
        case "Business Unit":
          // 100328	//Business Unit_AS
          result_data = GetCustomFiledValue(fieldValues, 100328);
          break;
        case "Seniority":
          // 100219	AS_Authority1(Seniority)  
          result_data = GetCustomFiledValue(fieldValues, 100219);
          break;
        case "Needs":
          // 100215	AS_Needs
          result_data = GetCustomFiledValue(fieldValues, 100215);
          break;
        case "TimeLine":
          // 100221	AS_TimeLine
          result_data = GetCustomFiledValue(fieldValues, 100221);
          break;
        case "Budget":
          // 100221	AS_TimeLine
          result_data = GetCustomFiledValue(fieldValues, 100220);
          break;
        case "Product_Category":
          // 100205	AS_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100205);
          break;
        case "Product_SubCategory":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Model":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Vertical_Level_1":
          //100206	AS_Business Sector(Lv1) // Vertical_Level_1
          result_data = GetConvertVerticalType1Code(GetCustomFiledValue(fieldValues, 100206));
          break;
        case "Vertical_Level_2":
          //100345	AS_Business Sector(Lv2) // Vertical_Level_2
          result_data = GetConvertVerticalType2Code(GetCustomFiledValue(fieldValues, 100206), GetCustomFiledValue(fieldValues, 100345));
          break;
      }
      break;
    case "CLS":
      switch (key) {
        case "Job Function":
          // 100327	CLS_Authority2(Job Function)  
          result_data = GetCustomFiledValue(fieldValues, 100327);
          break;
        case "Business Unit":
          // 100329	//Business Unit_CLS
          result_data = GetCustomFiledValue(fieldValues, 100327);
          break;
        case "Seniority":
          // 100289	CLS_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100289);
          break;
        case "Needs":
          // 100276	CLS_Needs
          result_data = GetCustomFiledValue(fieldValues, 100276);
          break;
        case "TimeLine":
          // 100278	CLS_TimeLine
          result_data = GetCustomFiledValue(fieldValues, 100278);
          break;
        case "Budget":
          // 100279	CLS_Budget
          result_data = GetCustomFiledValue(fieldValues, 100279);
          break;

        case "Product_Category":
          // 100277	CLS_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100277);
          break;
        case "Product_SubCategory":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Model":
          // 필드확인 필요 
          result_data = "";
          break;

        case "Vertical_Level_1":
          //100281	CLS_Business Sector(Lv1) // Vertical_Level_1
          result_data = GetConvertVerticalType1Code(GetCustomFiledValue(fieldValues, 100281));
          break;

        case "Vertical_Level_2":
          //100349	CLS_Business Sector(Lv2) // Vertical_Level_2
          result_data = GetConvertVerticalType2Code(GetCustomFiledValue(fieldValues, 100281), GetCustomFiledValue(fieldValues, 100349));
          break;
      }
      break;
    case "CM":
      switch (key) {
        case "Job Function":
          // 100325	CM_Authority2(Job Function)
          result_data = GetCustomFiledValue(fieldValues, 100325);
          break;
        case "Business Unit":
          // 100330	//Business Unit_CM
          result_data = GetCustomFiledValue(fieldValues, 100330);
          break;
        case "Seniority":
          // 100288	CM_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100288);
          break;
        case "Needs":
          // 100282	CM_Needs
          result_data = GetCustomFiledValue(fieldValues, 100282);
          break;
        case "TimeLine":
          // 100284	CM_TimeLine  
          result_data = GetCustomFiledValue(fieldValues, 100284);
          break;
        case "Budget":
          // 100285	CM_Budget
          result_data = GetCustomFiledValue(fieldValues, 100285);
          break;
        case "Category":
          // 100283	CM_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100283);
          break;

        case "Product_Category":
          // 100283	CM_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100283);
          break;
        case "Product_SubCategory":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Model":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Vertical_Level_1":
          //100287	CM_Business Sector(Lv1) // Vertical_Level_1
          result_data = GetConvertVerticalType1Code(GetCustomFiledValue(fieldValues, 100287));
          break;
        case "Vertical_Level_2":
          //100350	CM_Business Sector(Lv2) // Vertical_Level_2
          result_data = GetConvertVerticalType2Code(GetCustomFiledValue(fieldValues, 100287), GetCustomFiledValue(fieldValues, 100350));
          break;
      }
      break;
    case "ID":
      switch (key) {
        case "Job Function":
          // 100322	ID_Authority2(Job Function)
          result_data = GetCustomFiledValue(fieldValues, 100322);
          break;
        case "Business Unit":
          // 100331	//Business Unit_ID
          result_data = GetCustomFiledValue(fieldValues, 100331);
          break;
        case "Seniority":
          // 100262	ID_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100262);
          break;
        case "Needs":
          // 100254	ID_Needs
          result_data = GetCustomFiledValue(fieldValues, 100254);
          break;
        case "TimeLine":
          // 100255	ID_TimeLine
          result_data = GetCustomFiledValue(fieldValues, 100255);
          break;
        case "Budget":
          // 100256	ID_Budget
          result_data = GetCustomFiledValue(fieldValues, 100256);
          break;
        case "Product_Category":
          // 100257	ID_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100257);
          break;
        case "Product_SubCategory":
          // 100258	ID_Product_Sub-Category
          result_data = GetCustomFiledValue(fieldValues, 100258);
          break;
        case "Product_Model":
          // 100259	ID_Product_ModelName
          result_data = GetCustomFiledValue(fieldValues, 100259);
          break;
        case "Vertical_Level_1":
          //100261	ID_Business Sector(Lv1) // Vertical_Level_1
          result_data = GetConvertVerticalType1Code(GetCustomFiledValue(fieldValues, 100261));
          break;
        case "Vertical_Level_2":
          //100346	ID_Business Sector(Lv2) // Vertical_Level_2
          result_data = GetConvertVerticalType2Code(GetCustomFiledValue(fieldValues, 100261), GetCustomFiledValue(fieldValues, 100346));
          break;
      }
      break;
    case "IT":
      switch (key) {
        case "Job Function":
          // 100214	IT_Authority2(Job Function)
          result_data = GetCustomFiledValue(fieldValues, 100214);
          break;
        case "Business Unit":
          // 100332	//Business Unit_IT
          result_data = GetCustomFiledValue(fieldValues, 100332);
          break;
        case "Seniority":
          // 100269	IT_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100269);
          break;
        case "Needs":
          // 100264	IT_Needs
          result_data = GetCustomFiledValue(fieldValues, 100264);
          break;
        case "TimeLine":
          // 100265	IT_TimeLine
          result_data = GetCustomFiledValue(fieldValues, 100265);
          break;
        case "Budget":
          // 100266	IT_Budget
          result_data = GetCustomFiledValue(fieldValues, 100266);
          break;
        case "Product_Category":
          // 100263	IT_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100263);
          break;
        case "Product_SubCategory":
          // 100296	IT_Product Subcategory
          result_data = GetCustomFiledValue(fieldValues, 100296);
          break;
        case "Product_Model":
          // 100306	IT_Product_ModelName
          result_data = GetCustomFiledValue(fieldValues, 100306);
          break;
        case "Vertical_Level_1":
          //100268	IT_Business Sector(Lv1) // Vertical_Level_1
          result_data = GetConvertVerticalType1Code(GetCustomFiledValue(fieldValues, 100268));
          break;
        case "Vertical_Level_2":
          //100347	IT_Business Sector(Lv2) // Vertical_Level_2
          result_data = GetConvertVerticalType2Code(GetCustomFiledValue(fieldValues, 100268), GetCustomFiledValue(fieldValues, 100347));
          break;
      }
      break;
    case "Solar":
      switch (key) {
        case "Job Function":
          //100324	Solar_Authority2(Job Function)  
          result_data = GetCustomFiledValue(fieldValues, 100324);
          break;
        case "Business Unit":
          //100333	Business Unit_Solar
          result_data = GetCustomFiledValue(fieldValues, 100333);
          break;
        case "Seniority":
          // 100290	Solar_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100290);
          break;
        case "Needs":
          // 100291	Solar_Needs
          result_data = GetCustomFiledValue(fieldValues, 100291);
          break;
        case "TimeLine":
          // 100272	Solar_TimeLine  
          result_data = GetCustomFiledValue(fieldValues, 100272);
          break;
        case "Budget":
          // 100273	Solar_Budget
          result_data = GetCustomFiledValue(fieldValues, 100266);
          break;

        case "Product_Category":
          // 100271	Solar_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100271);
          break;
        case "Product_SubCategory":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Model":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Vertical_Level_1":
          //100275	Solar_Business Sector(Lv1) // Vertical_Level_1
          result_data = GetConvertVerticalType1Code(GetCustomFiledValue(fieldValues, 100275));
          break;
        case "Vertical_Level_2":
          //100348	Solar_Business Sector(Lv2) // Vertical_Level_2
          result_data = GetConvertVerticalType2Code(GetCustomFiledValue(fieldValues, 100275), GetCustomFiledValue(fieldValues, 100348));
          break;
      }
      break;
    case "Solution":
      switch (key) {
        case "Job Function":
          // 100321 Solution_Authority2(Job Function)  
          result_data = GetCustomFiledValue(fieldValues, 100321);
          break;
        case "Business Unit":
          //100335	Business Unit_Solution
          result_data = GetCustomFiledValue(fieldValues, 100335);
          break;
        case "Seniority":
          //100228	Solution_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100228);
          break;
        case "Needs":
          //100222	Solution_Needs
          result_data = GetCustomFiledValue(fieldValues, 100222);
          break;
        case "TimeLine":
          //100223	Solution_Timeline
          result_data = GetCustomFiledValue(fieldValues, 100223);
          break;
        case "Budget":
          //100224	Solution_Budget
          result_data = GetCustomFiledValue(fieldValues, 100224);
          break;
        case "Product_Category":
          //100225	Solution_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100225);
          break;
        case "Product_SubCategory":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Model":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Vertical_Level_1":
          //100227	Solution_Business Sector(Lv1) // Vertical_Level_1
          result_data = GetConvertVerticalType1Code(GetCustomFiledValue(fieldValues, 100227));
          break;
        case "Vertical_Level_2":
          //100351	IT_Business Sector(Lv2) // Vertical_Level_2
          result_data = GetConvertVerticalType2Code(GetCustomFiledValue(fieldValues, 100227), GetCustomFiledValue(fieldValues, 100351));
          break;
      }
      break;
  }
  return result_data;
}

function setBant_Update (contact_info){
  var bant_list = [
    100254 , 100255 , 100256 , 100262 , 100322 , // ID 
    100264 , 100265 , 100266 , 100269 , 100214 , // IT
    100291 , 100272 , 100273 , 100290 , 100324 , // Solar
    100215 , 100220 , 100221 , 100219 , 100323 , // AS
    100276 , 100278 , 100279 , 100289 , 100327 , // CLS
    100282 , 100284 , 100285 , 100288 , 100325 , // CM
    100222 , 100223 , 100224 , 100228 , 100321 , // Solution
  ]

  var status_list = [ 100337 , 100338 , 100339 , 100336 , 100341 , 100342 , 100343 ] // 순서대로 ID , IT , Solar , AS , CLS , CM , Solution 의 Status


  contact_info.forEach(async item => {
    let update_data = { 
      id : item.id,
      emailAddress: item.emailAddress 
    };
    update_data.fieldValues = [];
  
    await bant_list.forEach( field_id =>{
      update_data.fieldValues.push(setCustomFieldValue(field_id , ""));
    });
  
    await status_list.forEach(field_id =>{
      update_data.fieldValues.push(setCustomFieldValue(field_id , "Contact"));
    });
    console.log(update_data);

    
    await b2bgerp_eloqua.data.contacts.update(item.id , update_data ).then((result) => {
      console.log(result.data);
    }).catch((err) => {
      console.error(err.message);
    });
  })
 
  
}

function lpad(str, padLen, padStr) {
  if (padStr.length > padLen) {
    console.log("오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다");
    return str;
  }
  str += ""; // 문자로
  padStr += ""; // 문자로
  while (str.length < padLen)
    str = padStr + str;
  str = str.length >= padLen ? str.substring(0, padLen) : str;
  return str;
}


//#endregion

//#region B2B GERP 사업부별 조회 Endpoint

//BANT 조건 Eloqua 조회 함수
async function get_b2bgerp_global_bant_data(_business_name , start_date, end_date) {
  //BANT 조건 : Status - Contact / Pre-lead / MQL

  var business_name = _business_name;
  var status_bant = "";

  var contacts_data;
  var queryString = {}
  var queryText = "";

  switch (business_name) {
    case "AS":
      status_bant = "C_AS_Status1";
      break;
    case "IT":
      status_bant = "C_IT_Status1";
      break;
    case "ID":
      status_bant = "C_ID_Status1";
      break;
    case "Solar":
      status_bant = "C_Solar_Status1";
      break;
    case "CM":
      status_bant = "C_CM_Status1";
      break;
    case "CLS":
      status_bant = "C_CLS_Status1";
      break;
    case "Solution":
      status_bant = "C_Solution_Status1";
      break;
  }

  var yesterday_Object = utils.yesterday_getDateTime();
  start_date ? yesterday_Object.start = start_date : null;
  end_date ? yesterday_Object.end = end_date : null ;

  
  //var yesterday_Object = utils.today_getDateTime();
  var queryText = "C_DateModified>" + "'" + yesterday_Object.start + " 00:00:01'" + "C_DateModified<" + "'" + yesterday_Object.end + " 23:59:59'" + status_bant + "='MQL'";
  //yesterday_getUnixTime
  console.log("queryText : " + queryText);
  queryString['search'] = queryText;
  queryString['depth'] = "complete";
  queryString['count'] = 10;

  await b2bgerp_eloqua.data.contacts.get(queryString).then((result) => {

    if (result.data.total && result.data.total > 0) {
      contacts_data = result.data;
      console.log(result.data);
    }
  }).catch((err) => {
    console.error(err.message);
    return null;
  });
  return contacts_data;
}

//Eloqua Data B2B GERP Global Mapping 데이터 생성
function Convert_B2BGERP_GLOBAL_DATA(contacts_data, business_department) {
  var result_data = [];

  for (var i = 0; i < contacts_data.elements.length; i++) {
    try {
      var result_item = new B2B_GERP_GLOBAL_ENTITY();
      var FieldValues_data = contacts_data.elements[i].fieldValues;

      //result_item.INTERFACE_ID = "ELOQUA_0003" // this.INTERFACE_ID = "ELOQUA_0003"
      result_item.INTERFACE_ID = moment().format('YYYYMMDD') + lpad(seq_cnt, 4, "0");
      //리드네임 [MQL]Subsidiary_BU_Platform&Activity_Register Date+Hour 값을 조합
      //리드네임 {{Business Unit}}_{{Subsidiary}}_{{Platform}}_{{Activity}}_{{Date}}
      //리드네임 {{Business Unit}}_{{Subsidiary}}_{{Platform&Activity}}_{{Date}}
      //리드네임 {{100229}}_{{100196}}_{{100202}}_{{100026}}
      //리드네임 [MQL]Subsidiary_BU_Platform&Activity_Register Date+Hour 값을 조합

      seq_cnt = seq_cnt + 1;

      result_item.LEAD_NAME =
        //GetCustomFiledValue(FieldValues_data, 100229) + "_" +
        "[MQL]" + GetCustomFiledValue(FieldValues_data, 100196) + "_" +
        business_department + "_" +
        GetCustomFiledValue(FieldValues_data, 100202) + "_" +
        moment().format('YYYYMMDD');
      result_item.SITE_NAME = GetCustomFiledValue(FieldValues_data, 100187);        //100187	Territory //SITE_NAME ( 현장명 매핑필드 확인 ) //2021-02-02 기준 데이터 없음
      result_item.LEAD_SOURCE_TYPE = "11";                                          //default 11 (협의됨) //Eloqua에서 넘어오는 값이면 By Marketing, 영업인원이 수기입할 경우 By Sales로 지정

      result_item.LEAD_SOURCE_NAME = GetCustomFiledValue(FieldValues_data, 100202); //리드소스 네임 Platform&Activity 필드 매핑 // 폼에 히든값으로 존재

      result_item.ENTRY_TYPE = "L"                                                  //default L
      result_item.ACCOUNT = GetDataValue(contacts_data.elements[i].accountName);    //ACCOUNT ( 회사 )  // Company Name
      result_item.CONTACT_POINT =
        GetCustomFiledValue(FieldValues_data, 100172) + "/" +
        //GetDataValue(contacts_data.elements[i].firstName) + " " + GetDataValue(contacts_data.elements[i].lastName) + "/" +
        GetDataValue(contacts_data.elements[i].emailAddress) + "/" +
        GetDataValue(contacts_data.elements[i].mobilePhone);                        //Contact Point는 Eloqua 필드 중 -> Customer Name/Email/Phone No. 를 연결 시켜 매핑 필요
      result_item.CORPORATION = "LGE" + GetCustomFiledValue(FieldValues_data, 100196);  //법인정보 (확인필요); 	"LGE" + {{Subsidiary}}
      result_item.OWNER = "";                                                       //(확인필요);
      result_item.ADDRESS =
        GetDataValue(contacts_data.elements[i].address1) + " " +
        GetDataValue(contacts_data.elements[i].address2) + " " +
        GetDataValue(contacts_data.elements[i].address3);                           //주소정보 Address1 + Address2 + Address3 // Inquiry To Buy 주소 입력 없음
      //result_item.DESCRIPTION = GetDataValue(contacts_data.elements[i].description);//설명 Comments, message, inquiry-to-buy-message 필드 중 하나 (확인필요) //DESCRIPTION
      result_item.DESCRIPTION = GetCustomFiledValue(FieldValues_data, 100209);      //설명 inquiry-to-buy-message 필드 중 하나 (확인필요)

      result_item.ATTRIBUTE_1 = GetDataValue(contacts_data.elements[i].id);         //Eloqua Contact ID
      result_item.ATTRIBUTE_2 = GetBusiness_Department_data(FieldValues_data, business_department, "Budget"); //PRODUCT LV1의 BU 별 
      result_item.ATTRIBUTE_3 = GetBusiness_Department_data(FieldValues_data, business_department, "Vertical_Level_2"); //Vertical Level 2
      result_item.ATTRIBUTE_4 = GetDataValue(contacts_data.elements[i].emailAddress);   //이메일
      result_item.ATTRIBUTE_5 = GetDataValue(contacts_data.elements[i].mobilePhone);    //전화번호 (businessPhone 확인필요)
      result_item.ATTRIBUTE_6 = "";                                                     //(확인필요)
      result_item.ATTRIBUTE_7 = GetCustomFiledValue(FieldValues_data, 100069);          //지역 - 국가 eloqua filed 정보
      result_item.ATTRIBUTE_8 = "";
      result_item.ATTRIBUTE_9 = GetBusiness_Department_data(FieldValues_data, business_department, "Job Function"); //(Job Function 사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_10 = GetCustomFiledValue(FieldValues_data, 100229) //(Business Unit 가장 최근 기준 BU값)
      //result_item.ATTRIBUTE_10 = GetBusiness_Department_data(FieldValues_data, business_department, "Business Unit"); //(Business Unit 사업부별 컬럼 확인 필요)

      result_item.ATTRIBUTE_11 = "";                                                    //division (확인필요) 사업부코드( 코드마스터 필요 ) 예) HE    LGE 앞자리 빼는지 확인 필요
      result_item.ATTRIBUTE_12 = GetBusiness_Department_data(FieldValues_data, business_department, "Seniority"); //Seniority
      result_item.ATTRIBUTE_13 = GetBusiness_Department_data(FieldValues_data, business_department, "Needs");     //PRODUCT LV1의 BU 별 Needs //(Nees 사업부별 컬럼 확인 필요)  // Inquiry Type* Needs
      result_item.ATTRIBUTE_14 = GetBusiness_Department_data(FieldValues_data, business_department, "TimeLine");  //PRODUCT LV1의 BU 별 Timeline //(Nees 사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_15 = GetCustomFiledValue(FieldValues_data, 100203);                                   //Marketing Event //100203	Marketing Event // 폼 히든값
      result_item.ATTRIBUTE_16 = GetCustomFiledValue(FieldValues_data, 100213) == "Yes" ? "Y" : "N";              //Privacy Policy YN //100213	Privacy Policy_Agreed // privcy Policy*

      var Privacy_Policy_Date = utils.timeConverter("GET_DATE", GetCustomFiledValue(FieldValues_data, 100199));
      result_item.ATTRIBUTE_17 = Privacy_Policy_Date == null ? "" : Privacy_Policy_Date; //Privacy Policy Date : 100199	Privacy Policy_AgreedDate

      result_item.ATTRIBUTE_18 = GetCustomFiledValue(FieldValues_data, 100210) == "Yes" ? "Y" : "N";     //TransferOutside EEA YN : 100210	TransferOutsideCountry*

      var TransferOutside_EEA_Date = utils.timeConverter("GET_DATE", GetCustomFiledValue(FieldValues_data, 100208));
      result_item.ATTRIBUTE_19 = TransferOutside_EEA_Date == null ? "" : TransferOutside_EEA_Date; //TransferOutside EEA Date : 100208	TransferOutsideCountry_AgreedDate

      result_item.ATTRIBUTE_20 = GetBusiness_Department_data(FieldValues_data, business_department, "Product_Category");     //ELOQUA 내 Product 1 //(사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_21 = GetBusiness_Department_data(FieldValues_data, business_department, "Product_SubCategory");  //ELOQUA 내 Product 2 없을경우 NULL // (사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_22 = GetBusiness_Department_data(FieldValues_data, business_department, "Product_Model");        //ELOQUA 내 Product 3 없을경우 NULL // (사업부별 컬럼 확인 필요)

      result_item.ATTRIBUTE_23 = GetBusiness_Department_data(FieldValues_data, business_department, "Vertical_Level_1");    //Vertical Level_1

      result_item.REGISTER_DATE = moment().format('YYYY-MM-DD hh:mm:ss');    //어떤 날짜 정보인지 확인 필요 //utils.timeConverter("GET_DATE", contacts_data.elements[i].createdAt);
      result_item.TRANSFER_DATE = moment().format('YYYY-MM-DD hh:mm:ss');    //어떤 날짜 정보인지 확인 필요
      result_item.TRANSFER_FLAG = "Y";	 //TRANSFER_FLAG N , Y 값의 용도 확인 필요
      result_item.LAST_UPDATE_DATE = utils.timeConverter("GET_DATE", contacts_data.elements[i].updatedAt);

      result_data.push(result_item);
    }
    catch (e) {
      console.log(e);
    }
  }
  return result_data;
}

router.get('/:businessName/:start_date/:end_date', async function (req, res, next) {
  var business_name = req.params.businessName;
  var start_date = req.params.start_date;
  var end_date = req.params.end_date;
  console.log(start_date);
  console.log(end_date);
  //business_department ( AS , CLS , CM , ID , IT , Solar , Solution, Kr)

  //BANT기준 B2B GERP GLOBAL CONTACTS 조회
  var contacts_data = await get_b2bgerp_global_bant_data(business_name , start_date , end_date);
  // res.json(contacts_data);
  // return;
  if (contacts_data != null) {
    //Eloqua Contacts
    //business_department ( AS , CLS , CM , ID , IT , Solar , Solution, Kr )
    var request_data = Convert_B2BGERP_GLOBAL_DATA( contacts_data, business_name);
    console.log(contacts_data)
    var contact_list = contacts_data.elements.map(row => { 
      return {
        id : row.id ,
        emailAddress : row.emailAddress
      }; 
  });
    

    res.json({ ContentList: request_data });

    setBant_Update(contact_list) 
    console.log(contact_list);


    return;
  }
  else {
    res.json(false);
  }
  //API Gateway 데이터 전송

  //Log
  //res.json(true);
  return;
});
//#endregion

router.get('/req_data', function (req, res, next) {
  var id = 941;
  b2bgerp_eloqua.data.contacts.getOne(id).then((result) => {
    console.log(result.data);
    httpRequest.sender("http://localhost:8001/b2bgerp_global/contacts/req_data_yn", "POST", result.data);
  }).catch((err) => {
    console.error(err.message);
  });
});

// 가상의 LG API GATEWAY의 
router.post('/req_data_yn', function (req, res, next) {
  console.log("call req_data_yn");

  console.log(req.body);
});

// 가상의 LG API GATEWAY의 
router.get('/bant_test/:id/:email', async function (req, res, next) {
  console.log("call tester");
  
  
  var bant_init_data = await setBant_Update(req.params.id , req.params.email) ;
  console.log(bant_init_data);
  b2bgerp_eloqua.data.contacts.update(req.params.id , bant_init_data ).then((result) => {
    console.log(result.data);
    res.json(result.data);
  }).catch((err) => {
    console.error(err.message);
    res.send(false);
  });
});

module.exports = router;
