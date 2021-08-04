var express = require('express');
var router = express.Router();
var request = require('request');
var request_promise = require('request-promise');
var httpRequest = require('../../common/httpRequest');
var utils = require('../../common/utils');
var moment = require('moment');
var seq_cnt = 0;
var fs 		= require("mz/fs");
/* Contacts */

//#region B2B GERP GLOBAL ENTITY 정의 함수 영역


function B2B_GERP_GLOBAL_ENTITY() {
  this.INTERFACE_ID = "ELOQUA_0003", //  (필수값) 
    this.LEAD_NAME = "";        // (필수값) 리드네임 [MQL]Subsidiary_BU_Platform&Activity_Register Date+Hour 값을 조합
  this.SITE_NAME = "";				// (필수값) 사이트네임
  this.LEAD_SOURCE_NAME = "";	//리드소스 네임 Platform&Activity 필드 매핑
  this.LEAD_SOURCE_TYPE = "11";// (필수값) default 11 ? Eloqua에서 넘어오는 값이면 By Marketing, 영업인원이 수기입할 경우 By Sales로 지정
  this.ENTRY_TYPE = "L"       //default L
  this.ACCOUNT = "";          // (필수값) 회사
  this.CONTACT_POINT = "";    // (필수값) Contact Point는 Eloqua 필드 중 -> Customer Name/Email/Phone No. 를 연결 시켜 매핑 필요
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
  this.REGISTER_DATE = "";    // (필수값) 어떤 날짜 정보인지 확인 필요
  this.TRANSFER_DATE = "";    // (필수값) 어떤 날짜 정보인지 확인 필요
  this.TRANSFER_FLAG = "";		// (필수값) TRANSFER_FLAG N , Y 값의 용도 확인 필요 
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

function setCustomFieldValue(custom_id, custom_value) {
  return {
    "id": custom_id,
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

        case "Training/Experience center":
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

async function setBant_Update(bant_name ,  contact_list) {

  	var bu_bant_id_list = [];

  	switch(bant_name) {
		case "ID" : 
            bu_bant_id_list = [ '100254', '100255', '100256', '100337' ];
		break;

		case "IT" : 
            bu_bant_id_list = [ '100264', '100265', '100266', '100338' ];
		break;

		case "Solar" : 
            bu_bant_id_list = [ '100291', '100272', '100273', '100339' ];
		break;

		case "AS" : 
            bu_bant_id_list = [ '100215', '100220', '100221', '100336' ];
		break;

		case "CLS" : 
            bu_bant_id_list = [ '100276', '100278', '100279', '100341' ];
		break;

		case "CM" : 
            bu_bant_id_list = [ '100282', '100284', '100285', '100342' ];
		break;

		case "Solution" : 
            bu_bant_id_list = [ '100222', '100223', '100224', '100343' ];
		break;

        case "TEST" : 
            bu_bant_id_list = [ '100215', '100220', '100221', '100336' ];
        break;
  }
//   var bant_list = [
//     100254, 100255, 100256, // ID 
//     100264, 100265, 100266, // IT
//     //100291, 100272, 100273, // Solar
//     100215, 100220, 100221, // AS
//     100276, 100278, 100279, // CLS
//     100282, 100284, 100285, // CM
//     100222, 100223, 100224, // Solution
//   ]

//   var status_list = [100337, 100338, 100339, 100336, 100341, 100342, 100343] // 순서대로 ID , IT , Solar , AS , CLS , CM , Solution 의 Status

    var bant_result_list = [];
    for(let i = 0; contact_list.length > i ; i++){
		var bant_logs = {};
        contact_list[i]['accountname'] = contact_list[i].accountName;
        delete contact_list[i].accountName;

		

        for(let j = 0 ; contact_list[i].fieldValues.length > j ; j++){
            var FieldValues_item = contact_list[i].fieldValues[j];
            if(bu_bant_id_list.indexOf(FieldValues_item.id) > -1){
                contact_list[i].fieldValues[j].value = "";
            }
        }
        
    
        await b2bgerp_eloqua.data.contacts.update(contact_list[i].id, contact_list[i]).then((result) => {
			
			// console.log(result.data);

		
			bant_logs.email = contact_list[i].emailAddress;
			bant_logs.bant_update = "Y" ;
			bant_logs.message = "success";
			bant_result_list.push(bant_logs);
             	// console.log(result.data);
        }).catch((err) => {
			bant_logs.email = contact_list[i].emailAddress;
			bant_logs.bant_update = "Y" ;
			bant_logs.message = err.message;
			bant_result_list.push(bant_logs);
            console.error(err.message);
        });
		
    }

	return bant_result_list;
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
async function get_b2bgerp_global_bant_data(_business_name, start_date, end_date) {
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
        case "TEST" : 
            status_bant = "C_AS_Status1";
        break;
    }

	var yesterday_Object = utils.yesterday_getDateTime();
	start_date ? yesterday_Object.start = start_date : null;
	end_date ? yesterday_Object.end = end_date : null;

    // yesterday_Object.start = "2021-03-05";

	//var yesterday_Object = utils.today_getDateTime();

	var queryText = "C_DateModified>" + "'" + yesterday_Object.start + " 10:00:00'" + "C_DateModified<" + "'" + yesterday_Object.end + " 11:00:59'" + status_bant + "='MQL'";

	if(business_name == 'TEST' ) queryText += "emailAddress='jtlim@goldenplanet.co.kr'";
	// "emailAddress='jtlim@lge.com'emailAddress='jtlim@goldenplanet.co.kr'emailAddress='jtlim@test.com'emailAddress='jtlim@cnspartner.com'emailAddress='jtlim@intellicode.co.kr'emailAddress='jtlim@hsad.co.kr'emailAddress='jtlim@test.co.kr'emailAddress='jtlim@naver.com'emailAddress='jtlim@gmail.com'"
    console.log("queryText : " + queryText);
	queryString['search'] = queryText;
	queryString['depth'] = "complete";
	//   queryString['count'] = 1;

	await b2bgerp_eloqua.data.contacts.get(queryString).then((result) => {
        console.log("business_name : " + business_name + " result data 건수 : " + result.data.total );
		if (result.data.total && result.data.total > 0) {
			contacts_data = result.data;
		}
	}).catch((err) => {
		console.error(err);
		return null;
	});
	return contacts_data;
}

//Eloqua Data B2B GERP Global Mapping 데이터 생성
function Convert_B2BGERP_GLOBAL_DATA(contacts_data, business_department) {
  	var result_data = [];
	if(!contacts_data)  return;
  	for (var i = 0; i < contacts_data.elements.length; i++) {

		try {

			var result_item = new B2B_GERP_GLOBAL_ENTITY();
			var FieldValues_data = contacts_data.elements[i].fieldValues;

			//result_item.INTERFACE_ID = "ELOQUA_0003" // this.INTERFACE_ID = "ELOQUA_0003"

			var business_interface_num = 0;
			switch(business_department){
				case "AS": business_interface_num = 1; break;
				case "CLS": business_interface_num = 2; break;
				case "CM": business_interface_num = 3; break;
				case "ID": business_interface_num = 4; break;
				case "IT": business_interface_num = 5; break;
				case "Solar": business_interface_num = 6; break;
				case "Solution": business_interface_num = 7; break;
				case "TEST": business_interface_num = 1; break;
				default : business_interface_num = 0; break;
			}

			result_item.INTERFACE_ID = moment().format('YYYYMMDD') + business_interface_num + lpad(seq_cnt, 5, "0");
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
        
			result_item.SITE_NAME = GetCustomFiledValue(FieldValues_data, 100187) == "" ? "N/A" : GetCustomFiledValue(FieldValues_data, 100187);        //100187	Territory //SITE_NAME ( 현장명 매핑필드 확인 ) //2021-02-02 기준 데이터 없음
			result_item.LEAD_SOURCE_TYPE = "11";                                          //default 11 (협의됨) //Eloqua에서 넘어오는 값이면 By Marketing, 영업인원이 수기입할 경우 By Sales로 지정

			result_item.LEAD_SOURCE_NAME = GetCustomFiledValue(FieldValues_data, 100202) == "" ? "N/A" : GetCustomFiledValue(FieldValues_data, 100202); //리드소스 네임 Platform&Activity 필드 매핑 // 폼에 히든값으로 존재

			result_item.ENTRY_TYPE = "L"                                                  //default L
			result_item.ACCOUNT = GetDataValue(contacts_data.elements[i].accountName) == "" ? "N/A" : GetDataValue(contacts_data.elements[i].accountName);    //ACCOUNT ( 회사 )  // Company Name
			result_item.CONTACT_POINT =
			GetCustomFiledValue(FieldValues_data, 100172) + "/" +
			//GetDataValue(contacts_data.elements[i].firstName) + " " + GetDataValue(contacts_data.elements[i].lastName) + "/" +
			GetDataValue(contacts_data.elements[i].emailAddress) + "/" +
			GetDataValue(contacts_data.elements[i].mobilePhone);                        //Contact Point는 Eloqua 필드 중 -> Customer Name/Email/Phone No. 를 연결 시켜 매핑 필요
			result_item.CORPORATION = "LGE" + GetCustomFiledValue(FieldValues_data, 100196);  //법인정보 "LGE" + {{Subsidiary}}
			result_item.OWNER = "";                                                       //(확인필요);
			
			
			let address = "";
			address += GetDataValue(contacts_data.elements[i].address1);
			if(address != "") address += " " + GetDataValue(contacts_data.elements[i].address2);
			if(address != "") address += " " + GetDataValue(contacts_data.elements[i].address3);
			address += "/" + GetDataValue(contacts_data.elements[i].city) + "/"  + GetDataValue(contacts_data.elements[i].country);	//주소정보 Address1 + Address2 + Address3 // Inquiry To Buy 주소 입력 없음



			result_item.ADDRESS = address;
			//result_item.DESCRIPTION = GetDataValue(contacts_data.elements[i].description);//설명 Comments, message, inquiry-to-buy-message 필드 중 하나 (확인필요) //DESCRIPTION
			let description = GetCustomFiledValue(FieldValues_data, 100209);
			result_item.DESCRIPTION = description.length >= 1500 ? description.substring(0,1675) : description ;      //설명 inquiry-to-buy-message 필드

			result_item.ATTRIBUTE_1 = GetDataValue(contacts_data.elements[i].id);         //Eloqua Contact ID
			result_item.ATTRIBUTE_2 = GetBusiness_Department_data(FieldValues_data, business_department, "Budget"); //PRODUCT LV1의 BU 별 
			result_item.ATTRIBUTE_3 = GetBusiness_Department_data(FieldValues_data, business_department, "Vertical_Level_2"); //Vertical Level 2
			result_item.ATTRIBUTE_4 = GetDataValue(contacts_data.elements[i].emailAddress);   //이메일
			result_item.ATTRIBUTE_5 = GetDataValue(contacts_data.elements[i].mobilePhone);    //전화번호 (businessPhone 확인필요)
			result_item.ATTRIBUTE_6 = "";                                                     //(확인필요)
			result_item.ATTRIBUTE_7 = GetCustomFiledValue(FieldValues_data, 100069);          //지역 - 국가 eloqua filed 정보
			result_item.ATTRIBUTE_8 = "";
			result_item.ATTRIBUTE_9 = GetBusiness_Department_data(FieldValues_data, business_department, "Job Function"); //(Job Function 사업부별 컬럼 확인 필요)
			result_item.ATTRIBUTE_10 = business_department; //(Business Unit 가장 최근 기준 BU값)
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
			result_item.TRANSFER_FLAG = "Y";	 									//TRANSFER_FLAG N , Y 값의 용도 확인 필요
			result_item.LAST_UPDATE_DATE = utils.timeConverter("GET_DATE", contacts_data.elements[i].updatedAt);



			let notBant_emailType_List = ["@lg.com", "@lge.com" , "@goldenplanet.co.kr" , "@test.com" , "@cnspartner.com", "@intellicode.co.kr" , "@hsad.co.kr" , "@test.co.kr", "@test.test", "@testtest.com"];
			// let notBant_emailType_List = ["@goldenplanet.co.kr"];
			let notBant_email_list  = notBant_emailType_List.filter(function (sentence) { 
				return result_item.ATTRIBUTE_4.indexOf( sentence ) > -1 ? result_item.ATTRIBUTE_4 : null ; });

				// for(let k = 0 ; notBant_emailType_List.length > k ; k++){
				// 	let notBant_item = notBant_emailType_List[k];
				// 	notBant_item
				// }
			// console.log(notBant_email_list.length);
			
			if( result_item.CORPORATION != "" && result_item.CORPORATION != "LGE" && notBant_email_list.length < 1 ) 
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
	var contacts_data = await get_b2bgerp_global_bant_data(business_name, start_date, end_date);
	// res.json(contacts_data);
	// return;
  	if (contacts_data != null) {
		//Eloqua Contacts
		//business_department ( AS , CLS , CM , ID , IT , Solar , Solution, Kr )
		var request_data = await Convert_B2BGERP_GLOBAL_DATA(contacts_data, business_name);
		console.log(contacts_data);
		var contact_list = contacts_data.elements.map(row => {
			return {
				id: row.id,
				emailAddress: row.emailAddress
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

// 가상의 LG API GATEWAY의 
router.post('/req_data_yn', function (req, res, next) {
	console.log("call req_data_yn");
	console.log(req.body.ContentList.length);
	// console.log(req.body);
	res.json(req.body);
});


// B2B GERP GLOBAL 개발쪽으로 테스트 데이터를 전송한다. 
router.get('/test_sender', async function (req, res, next) {
	console.log("test_sender 호출");


	let test_data = [
		{
		  "INTERFACE_ID": 20210705100008,
		  "LEAD_NAME": "[MQL]SP_AS_Webinar(Online)_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "Webinar(Online)",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Air King Ar Condicionado",
		  "CONTACT_POINT": "Alessandro Caldeira/alessandromc29@hotmail.com/(11) 99728-1753",
		  "CORPORATION": "LGESP",
		  "OWNER": "",
		  "ADDRESS": "/Salto/Brazil",
		  "DESCRIPTION": "Ótimo",
		  "ATTRIBUTE_1": 491450,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "alessandromc29@hotmail.com",
		  "ATTRIBUTE_5": "(11) 99728-1753",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Latin America and the Caribbean",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Entry Level ",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_SP_Webinar_Esquadrao_210701",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 20:51:42",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 20:51:42",
		  "ATTRIBUTE_20": "",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:11:05",
		  "CUSTOMOBJECT_ID": 2100964
		},
		{
		  "INTERFACE_ID": 20210705100009,
		  "LEAD_NAME": "[MQL]SP_AS_Webinar(Online)_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "Webinar(Online)",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Eg refrigeração ",
		  "CONTACT_POINT": "Eggon Hermick/eggon_@hotmail.com/(81) 99228-6235",
		  "CORPORATION": "LGESP",
		  "OWNER": "",
		  "ADDRESS": "/São Bento do una /Brazil",
		  "DESCRIPTION": "Top tirei muitas dúvidas ",
		  "ATTRIBUTE_1": 497666,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "eggon_@hotmail.com",
		  "ATTRIBUTE_5": "(81) 99228-6235",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Latin America and the Caribbean",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Entry Level ",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_SP_Webinar_Esquadrao_210701",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 20:57:08",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 20:57:08",
		  "ATTRIBUTE_20": "",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:09:52",
		  "CUSTOMOBJECT_ID": 2100966
		},
		{
		  "INTERFACE_ID": 20210705100010,
		  "LEAD_NAME": "[MQL]SP_AS_Webinar(Online)_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "Webinar(Online)",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Polo Frio Refrigeração",
		  "CONTACT_POINT": "Jhonatan Correa de Araujo/jhonatanac2001@gmail.com/22 99840-8046",
		  "CORPORATION": "LGESP",
		  "OWNER": "",
		  "ADDRESS": "/Campos dos Goytacazes/Brazil",
		  "DESCRIPTION": "Bom",
		  "ATTRIBUTE_1": 502444,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "jhonatanac2001@gmail.com",
		  "ATTRIBUTE_5": "22 99840-8046",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Latin America and the Caribbean",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Other",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Entry Level ",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_SP_Webinar_Esquadrao_210701",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 22:40:32",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 22:40:32",
		  "ATTRIBUTE_20": "",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:10:46",
		  "CUSTOMOBJECT_ID": 2100968
		},
		{
		  "INTERFACE_ID": 20210705100011,
		  "LEAD_NAME": "[MQL]SP_AS_Webinar(Online)_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "Webinar(Online)",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Autonomo",
		  "CONTACT_POINT": "Patric Trindade/patricsilvatrindade@bol.com.br/55 999588974",
		  "CORPORATION": "LGESP",
		  "OWNER": "",
		  "ADDRESS": "/Alegrete/Brazil",
		  "DESCRIPTION": "Muito bom",
		  "ATTRIBUTE_1": 508499,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "patricsilvatrindade@bol.com.br",
		  "ATTRIBUTE_5": "55 999588974",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Latin America and the Caribbean",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Entry Level ",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_SP_Webinar_Esquadrao_210701",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 21:05:21",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 21:05:21",
		  "ATTRIBUTE_20": "",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:11:05",
		  "CUSTOMOBJECT_ID": 2100971
		},
		{
		  "INTERFACE_ID": 20210705100012,
		  "LEAD_NAME": "[MQL]SP_AS_Webinar(Online)_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "Webinar(Online)",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Eletrificar Serviços",
		  "CONTACT_POINT": "Carlos Magno/eletrificarservicos.st@gmail.com/+55 22 99963-5512",
		  "CORPORATION": "LGESP",
		  "OWNER": "",
		  "ADDRESS": "/Campos dos Goytacazes/Brazil",
		  "DESCRIPTION": "Uma evento de muito aprendizado em que deveria ter mais vezes.",
		  "ATTRIBUTE_1": 519924,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "eletrificarservicos.st@gmail.com",
		  "ATTRIBUTE_5": "+55 22 99963-5512",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Latin America and the Caribbean",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Other",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Entry Level ",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_SP_Webinar_Esquadrao_210701",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 21:31:10",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 21:31:10",
		  "ATTRIBUTE_20": "",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:11:15",
		  "CUSTOMOBJECT_ID": 2100973
		},
		{
		  "INTERFACE_ID": 20210705100013,
		  "LEAD_NAME": "[MQL]GF_AS_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Al Ghurair Trading Co",
		  "CONTACT_POINT": "Ali Majid Al Ghurair/ali.alghurair@icloud.com/0504363333",
		  "CORPORATION": "LGEGF",
		  "OWNER": "",
		  "ADDRESS": "/Dubai/U.A.E",
		  "DESCRIPTION": "Need a VRF proposal for Gym facilities ",
		  "ATTRIBUTE_1": 528226,
		  "ATTRIBUTE_2": "$100,000 ~ $500,000",
		  "ATTRIBUTE_3": 1011,
		  "ATTRIBUTE_4": "ali.alghurair@icloud.com",
		  "ATTRIBUTE_5": "0504363333",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Middle East & Africa",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "AS_GF_LG.com_I2B_Eng",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 10:08:11",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 10:08:11",
		  "ATTRIBUTE_20": "VRF",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 10,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:10:46",
		  "CUSTOMOBJECT_ID": 2100975
		},
		{
		  "INTERFACE_ID": 20210705100014,
		  "LEAD_NAME": "[MQL]IL_AS_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Individual",
		  "CONTACT_POINT": "Hemant Sharma/hem.sharma29@gmail.com/9880765432",
		  "CORPORATION": "LGEIL",
		  "OWNER": "",
		  "ADDRESS": "/Rajasthan/India",
		  "DESCRIPTION": "Hi I need solution for central ac cooling",
		  "ATTRIBUTE_1": 578498,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "hem.sharma29@gmail.com",
		  "ATTRIBUTE_5": "9880765432",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Accounting",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Other",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "AS_Global_Asia_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 03:15:28",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 03:15:28",
		  "ATTRIBUTE_20": "Multi-Split",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:13:49",
		  "CUSTOMOBJECT_ID": 2100976
		},
		{
		  "INTERFACE_ID": 20210705100015,
		  "LEAD_NAME": "[MQL]IL_AS_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Pramod.kabadi24@gmail.com",
		  "CONTACT_POINT": "Pramod Kabadi/Pramod.kabadi24@gmail.com/7259245150",
		  "CORPORATION": "LGEIL",
		  "OWNER": "",
		  "ADDRESS": "/Bangalore/India",
		  "DESCRIPTION": "Is it available in india",
		  "ATTRIBUTE_1": 578501,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "Pramod.kabadi24@gmail.com",
		  "ATTRIBUTE_5": "7259245150",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Arts and Design",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Manager",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_Global_Asia_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 04:30:24",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 04:30:24",
		  "ATTRIBUTE_20": "Multi-Split",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:13:49",
		  "CUSTOMOBJECT_ID": 2100977
		},
		{
		  "INTERFACE_ID": 20210705100016,
		  "LEAD_NAME": "[MQL]IL_AS_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Dental Care Clinic",
		  "CONTACT_POINT": "Dr. Rajesh Gupta/tanishqgupta22.08.2003@gmail.com/9826348489",
		  "CORPORATION": "LGEIL",
		  "OWNER": "",
		  "ADDRESS": "/Rewa/India",
		  "DESCRIPTION": "Tower AC",
		  "ATTRIBUTE_1": 578519,
		  "ATTRIBUTE_2": "N/A",
		  "ATTRIBUTE_3": 502,
		  "ATTRIBUTE_4": "tanishqgupta22.08.2003@gmail.com",
		  "ATTRIBUTE_5": "9826348489",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Healthcare Services",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "N/A",
		  "ATTRIBUTE_15": "AS_IL_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 09:57:41",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 09:57:41",
		  "ATTRIBUTE_20": "Etc.",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 5,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:14:16",
		  "CUSTOMOBJECT_ID": 2100978
		},
		{
		  "INTERFACE_ID": 20210705100017,
		  "LEAD_NAME": "[MQL]IN_AS_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "PT. TD Williamson Indonesia",
		  "CONTACT_POINT": "Ahmad Zaky/ahmad.zaky@tdwilliamson.com/08111462459",
		  "CORPORATION": "LGEIN",
		  "OWNER": "",
		  "ADDRESS": "/South Jakarta/Indonesia",
		  "DESCRIPTION": "I want to have a multisplit cooling system in my house",
		  "ATTRIBUTE_1": 578526,
		  "ATTRIBUTE_2": "N/A",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "ahmad.zaky@tdwilliamson.com",
		  "ATTRIBUTE_5": "08111462459",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Engineering",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Associate/Analyst",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "AS_IN_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 11:38:02",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 11:38:02",
		  "ATTRIBUTE_20": "Multi-Split",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:13:45",
		  "CUSTOMOBJECT_ID": 2100979
		},
		{
		  "INTERFACE_ID": 20210705100018,
		  "LEAD_NAME": "[MQL]IS_AS_Etc._20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "Etc.",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Privato",
		  "CONTACT_POINT": "Saverio Valente/mariovalente3@virgilio.it/3313629387",
		  "CORPORATION": "LGEIS",
		  "OWNER": "",
		  "ADDRESS": "//Italy",
		  "DESCRIPTION": "                    Devo acquistare un dual split",
		  "ATTRIBUTE_1": 578528,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "mariovalente3@virgilio.it",
		  "ATTRIBUTE_5": "3313629387",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Europe",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_IS_DigitalCampaign_LGDUALCOOLAtmosfera_210409",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 11:44:14",
		  "ATTRIBUTE_18": "N",
		  "ATTRIBUTE_19": "",
		  "ATTRIBUTE_20": "",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:14:54",
		  "CUSTOMOBJECT_ID": 2100980
		},
		{
		  "INTERFACE_ID": 20210705100019,
		  "LEAD_NAME": "[MQL]AF_AS_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Prime ventures",
		  "CONTACT_POINT": "Daniel Ochonwa/morisstaban@gmail.com/07063268144",
		  "CORPORATION": "LGEAF",
		  "OWNER": "",
		  "ADDRESS": "/Owerri/Nigeria",
		  "DESCRIPTION": "I'd like to know exactly how this works",
		  "ATTRIBUTE_1": 578539,
		  "ATTRIBUTE_2": "$100,000 ~ $500,000",
		  "ATTRIBUTE_3": 1501,
		  "ATTRIBUTE_4": "morisstaban@gmail.com",
		  "ATTRIBUTE_5": "07063268144",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Middle East & Africa",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Operations",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "9 Months ~ 1 year",
		  "ATTRIBUTE_15": "AS_AF_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 15:18:46",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 15:18:46",
		  "ATTRIBUTE_20": "Single-Split",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 15,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:14:16",
		  "CUSTOMOBJECT_ID": 2100981
		},
		{
		  "INTERFACE_ID": 20210705100020,
		  "LEAD_NAME": "[MQL]CI_AS_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Shoreline (Strata)",
		  "CONTACT_POINT": "Brian Bradley/shorelinepresident@outlook.com/6043638439",
		  "CORPORATION": "LGECI",
		  "OWNER": "",
		  "ADDRESS": "/British Columbia / Vancouver/Canada",
		  "DESCRIPTION": "I am the Council President for a 166 unit strata in Vancouver called Shoreline.  We have had ongoing issues with the three MAUs on the roofs of our three buildings.  They currently provide heat only, with no cooling during the hot summer months.  We want to enquire about LG's MAU options with heating and cooling included.  A highly efficient heat pump solution would be our preference.\n\nAlso, with the recent heat wave, we are looking at ways to provide a long term, in-unit A/C solution for our residents.  We currently have only hydronic heat, provided by a district utility called River District Energy.  We are currently looking at LG's single split heat pump as one option.  The issue is having 166 condenser units taking up valuable space on every unit's balcony.  There is also the issue of appearance.\n\nThe second option we are investigating is the possibility of installing commercial rooftop heat pumps on each building.  We would like to know the options available for this solution and whether retrofitting our three buildings would be possible.\n\nLastly, we would like to get a sense of the cost for these three different items would be.  The MAUs, bulk ordered mini splits for each unit, and a rooftop option for in unit splits.\n\nThank you,\n\nBrian Bradley\nPresident\nShoreline Council",
		  "ATTRIBUTE_1": 578543,
		  "ATTRIBUTE_2": "N/A",
		  "ATTRIBUTE_3": 1505,
		  "ATTRIBUTE_4": "shorelinepresident@outlook.com",
		  "ATTRIBUTE_5": "6043638439",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "North America",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Other",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Other",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "N/A",
		  "ATTRIBUTE_15": "AS_Global_North America_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 15:57:38",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 15:57:38",
		  "ATTRIBUTE_20": "VRF",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 15,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:13:45",
		  "CUSTOMOBJECT_ID": 2100982
		},
		{
		  "INTERFACE_ID": 20210705100021,
		  "LEAD_NAME": "[MQL]SP_AS_Webinar(Online)_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "Webinar(Online)",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "BenFrio Climatização ",
		  "CONTACT_POINT": "Raul Johnson/benfrioltda@gmail.com/87991290324",
		  "CORPORATION": "LGESP",
		  "OWNER": "",
		  "ADDRESS": "/Arcoverde/",
		  "DESCRIPTION": "Muito bom",
		  "ATTRIBUTE_1": 578560,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "benfrioltda@gmail.com",
		  "ATTRIBUTE_5": "87991290324",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Entry Level ",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_SP_Webinar_Esquadrao_210701",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 20:59:44",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 20:59:44",
		  "ATTRIBUTE_20": "",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:13:45",
		  "CUSTOMOBJECT_ID": 2100983
		},
		{
		  "INTERFACE_ID": 20210705100022,
		  "LEAD_NAME": "[MQL]AP_AS_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Gordon Brothers",
		  "CONTACT_POINT": "Travis Roberts/travis.roberts@gordonbrothers.com.au/0417518365",
		  "CORPORATION": "LGEAP",
		  "OWNER": "",
		  "ADDRESS": "/Melbourne/Australia",
		  "DESCRIPTION": "Hi,\n\nJust seeking some technical information and budget pricing for the LG range of oil free magnetic bearing chillers?\n\nRegards",
		  "ATTRIBUTE_1": 578567,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": 1010,
		  "ATTRIBUTE_4": "travis.roberts@gordonbrothers.com.au",
		  "ATTRIBUTE_5": "0417518365",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Engineering",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Manager",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "3 Months ~ 6 Months",
		  "ATTRIBUTE_15": "AS_Global_Asia_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 23:49:41",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 23:49:41",
		  "ATTRIBUTE_20": "Chiller",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 10,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:17:18",
		  "CUSTOMOBJECT_ID": 2100984
		},
		{
		  "INTERFACE_ID": 20210705100023,
		  "LEAD_NAME": "[MQL]SP_AS_Webinar(Online)_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "Webinar(Online)",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Wr refrigeração",
		  "CONTACT_POINT": "Wesley Roger/wrrefrigerar@gmail.com/31971740237",
		  "CORPORATION": "LGESP",
		  "OWNER": "",
		  "ADDRESS": "/Betim/",
		  "DESCRIPTION": "Show",
		  "ATTRIBUTE_1": 578568,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "wrrefrigerar@gmail.com",
		  "ATTRIBUTE_5": "31971740237",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder ",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_SP_Webinar_Esquadrao_210701",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 23:54:30",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 23:54:30",
		  "ATTRIBUTE_20": "",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:17:20",
		  "CUSTOMOBJECT_ID": 2100985
		},
		{
		  "INTERFACE_ID": 20210705400001,
		  "LEAD_NAME": "[MQL]MK_ID_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Transdigital Entertainment",
		  "CONTACT_POINT": "Frank Farago/frankfarago@gmail.com/36203121760",
		  "CORPORATION": "LGEMK",
		  "OWNER": "",
		  "ADDRESS": "/Budapest/Hungary",
		  "DESCRIPTION": "LG Commercial LCD Displays & Projectors -- 4 JULY 2021\nHello There, LG Business Solutions:\n\nWe are interesting in purchasing:\n\nCommercial LCD Display to be used in a post production studio screening room. 86-inch or 98-inch diagonal size. Obviously a GENERAL USE COMMERCIAL MONITOR.\n\nWhat have you got exactly and at what price? Where can we see these displays? Where can we purchase them (besides from B&H Photo Video in New York)?\n\nOther than LCD with a local dimming LED backlight (not merely edge-lit), what do you have with OLED panels? How much more would those be for the comparable sizes (86-inch, 88-inch, 98-inch)?\n\nPossibly a seamless Micro LED video wall, UHD 4K resolution, app. 110 to 120-inch diagonal size. Although I believe one of these would cost much, much more money than even your largest single piece commercial LCD display, correct?\n\nLet me know what you have got, at what approximate prices, and from where we can get them? New Castle, DE 19720 USA.\nFinally, a 3LCD Projector, 3000 to 6500 ANSI Lumen brightness, short throw lens throw ratio approximately 0.5:1 to 1.1:1.\n\nIncidentally, I did contact many of your LG commercial products resellers about one year ago, however I was not able to get one single price quote from any of them. So now, we only want to purchase from a reputable, large online reseller. Note that we prefer not to deal with a Hungarian company. \nMost sincerely,\nFrank Farago\n\nFrank Farago, Producer & CEOTransdigital Entertainment Co. / Danublue Screening & Post\n\n1015 Budapest I. ker.\nDonáti utca 6, fsz. 2.HUNGARY\n\n+36 20-312-1760 (Hungary mobile)\n+36 1-791-6176 (Budapest landline)\n\nfrankfarago",
		  "ATTRIBUTE_1": 261826,
		  "ATTRIBUTE_2": "Less than $100,000",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "frankfarago@gmail.com",
		  "ATTRIBUTE_5": "36203121760",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Europe",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Media and Communication",
		  "ATTRIBUTE_10": "ID",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder",
		  "ATTRIBUTE_13": "Quotation or purchase consultation",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "ID_HQ_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 11:15:36",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 11:15:36",
		  "ATTRIBUTE_20": "LED Signage",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 10,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:12:10",
		  "CUSTOMOBJECT_ID": 2100963
		},
		{
		  "INTERFACE_ID": 20210705400002,
		  "LEAD_NAME": "[MQL]IL_ID_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Parivartan Eduventures",
		  "CONTACT_POINT": "Akshay Tiwari/ananda.vardhan.rnsm@gmail.com/8420002622",
		  "CORPORATION": "LGEIL",
		  "OWNER": "",
		  "ADDRESS": "/Kolkata/India",
		  "DESCRIPTION": "I want to Know about the Interactive Panel Costs.",
		  "ATTRIBUTE_1": 553022,
		  "ATTRIBUTE_2": "Less than $100,000",
		  "ATTRIBUTE_3": 205,
		  "ATTRIBUTE_4": "ananda.vardhan.rnsm@gmail.com",
		  "ATTRIBUTE_5": "8420002622",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Education",
		  "ATTRIBUTE_10": "ID",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder",
		  "ATTRIBUTE_13": "Quotation or purchase consultation",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "ID_IL_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 09:26:15",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 09:26:15",
		  "ATTRIBUTE_20": "Interactive Signage",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 2,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:22:26",
		  "CUSTOMOBJECT_ID": 2100965
		},
		{
		  "INTERFACE_ID": 20210705400003,
		  "LEAD_NAME": "[MQL]GF_ID_C-display_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "C-display",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Bayt Al Tawreed LLC",
		  "CONTACT_POINT": "Jomy Thomas/jomy@hudalighting.com/0508554747",
		  "CORPORATION": "LGEGF",
		  "OWNER": "",
		  "ADDRESS": "//U.A.E",
		  "DESCRIPTION": "Hi, Please send us prices or get us in touch with your distributor in the region.",
		  "ATTRIBUTE_1": 578506,
		  "ATTRIBUTE_2": "N/A ",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "jomy@hudalighting.com",
		  "ATTRIBUTE_5": "0508554747",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Middle East & Africa",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Sales",
		  "ATTRIBUTE_10": "ID",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Manager",
		  "ATTRIBUTE_13": "Quotation or purchase consultation",
		  "ATTRIBUTE_14": "N/A",
		  "ATTRIBUTE_15": "ID_HQ_Cdisplay_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 07:10:40",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 07:10:40",
		  "ATTRIBUTE_20": "Interactive Signage",
		  "ATTRIBUTE_21": "TR3BF Series",
		  "ATTRIBUTE_22": "75TR3BF-B",
		  "ATTRIBUTE_23": 1,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:22:43",
		  "CUSTOMOBJECT_ID": 2100967
		},
		{
		  "INTERFACE_ID": 20210705400004,
		  "LEAD_NAME": "[MQL]PH_ID_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Aav trading",
		  "CONTACT_POINT": "Vince navoa/aav.trading@yahoo.com/09396180961",
		  "CORPORATION": "LGEPH",
		  "OWNER": "",
		  "ADDRESS": "/Quezon city/Philippines",
		  "DESCRIPTION": "LG 55VL5G 55\n\nDo you have this model 17pcs of it",
		  "ATTRIBUTE_1": 578521,
		  "ATTRIBUTE_2": "N/A",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "aav.trading@yahoo.com",
		  "ATTRIBUTE_5": "09396180961",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Sales",
		  "ATTRIBUTE_10": "ID",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder",
		  "ATTRIBUTE_13": "Quotation or purchase consultation",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "ID_HQ_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 10:37:27",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 10:37:27",
		  "ATTRIBUTE_20": "OLED Signage",
		  "ATTRIBUTE_21": "Flat OLED Signage",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:22:43",
		  "CUSTOMOBJECT_ID": 2100969
		},
		{
		  "INTERFACE_ID": 20210705400005,
		  "LEAD_NAME": "[MQL]SB_ID_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Future Ways Arabia",
		  "CONTACT_POINT": "Faiyaaz Ahmed/projects@futurewaysarabia.com/",
		  "CORPORATION": "LGESB",
		  "OWNER": "",
		  "ADDRESS": "/Riyadh/Saudi Arabia",
		  "DESCRIPTION": "Require 2 quantities of 43UT661H. ",
		  "ATTRIBUTE_1": 578527,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "projects@futurewaysarabia.com",
		  "ATTRIBUTE_5": "",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Middle East & Africa",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Sales",
		  "ATTRIBUTE_10": "ID",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Manager",
		  "ATTRIBUTE_13": "Quotation or purchase consultation",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "ID_SB_LG.com_I2B_Eng",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 11:39:19",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 11:39:19",
		  "ATTRIBUTE_20": "Hotel TV",
		  "ATTRIBUTE_21": "UT665H Series",
		  "ATTRIBUTE_22": "43UT665H (EU)",
		  "ATTRIBUTE_23": 5,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:14:11",
		  "CUSTOMOBJECT_ID": 2100970
		},
		{
		  "INTERFACE_ID": 20210705400006,
		  "LEAD_NAME": "[MQL]SB_ID_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Thales Group",
		  "CONTACT_POINT": "MUHAMMAD KHAN/engr.msk@gmail.com/966564836116",
		  "CORPORATION": "LGESB",
		  "OWNER": "",
		  "ADDRESS": "/Jeddah/Saudi Arabia",
		  "DESCRIPTION": "I am looking for 10 units of above mentioned OLED display models.\n\nKindly contact me ASAP in order to move forward.",
		  "ATTRIBUTE_1": 578529,
		  "ATTRIBUTE_2": "Less than $100,000",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "engr.msk@gmail.com",
		  "ATTRIBUTE_5": "966564836116",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Middle East & Africa",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Engineering",
		  "ATTRIBUTE_10": "ID",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Manager",
		  "ATTRIBUTE_13": "Quotation or purchase consultation",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "ID_HQ_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 12:15:17",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 12:15:17",
		  "ATTRIBUTE_20": "OLED Signage",
		  "ATTRIBUTE_21": "Flat OLED Signage",
		  "ATTRIBUTE_22": "65EJ5E-B",
		  "ATTRIBUTE_23": 11,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:22:43",
		  "CUSTOMOBJECT_ID": 2100972
		},
		{
		  "INTERFACE_ID": 20210705400007,
		  "LEAD_NAME": "[MQL]IL_ID_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "TREE-D HUBS LLP",
		  "CONTACT_POINT": "KAPPA SAI KRISHNA ANURUP/founders@treedhubs.in/+91-8555034038",
		  "CORPORATION": "LGEIL",
		  "OWNER": "",
		  "ADDRESS": "/VISAKHAPATNAM/India",
		  "DESCRIPTION": "Hello team, we are looking for LG interactive display 65 inches. Kindly share me the availability and quotation for 1 unit.",
		  "ATTRIBUTE_1": 578540,
		  "ATTRIBUTE_2": "Less than $100,000",
		  "ATTRIBUTE_3": 117,
		  "ATTRIBUTE_4": "founders@treedhubs.in",
		  "ATTRIBUTE_5": "+91-8555034038",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Business Development",
		  "ATTRIBUTE_10": "ID",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder",
		  "ATTRIBUTE_13": "Quotation or purchase consultation",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "ID_IL_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 15:22:19",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 15:22:19",
		  "ATTRIBUTE_20": "Interactive Signage",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 1,
		  "REGISTER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_DATE": "2021-07-05 03:05:03",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:22:43",
		  "CUSTOMOBJECT_ID": 2100974
		},
		{
		  "INTERFACE_ID": 20210705500000,
		  "LEAD_NAME": "[MQL]BN_IT_LG.com_20210705",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Consultom",
		  "CONTACT_POINT": "Tom Hendriksen/tom@consultom.com/31628147462",
		  "CORPORATION": "LGEBN",
		  "OWNER": "",
		  "ADDRESS": "/Arnhem/Netherlands",
		  "DESCRIPTION": "Hello,\nI own a LG 34UC97-S/34\" IPS 17/9 DP DVI HDMI black (34UC97-S). Is there still a mounting system available ? I want to attach the monitor to a monitor arm, but I need to have the (wall) mount for this monitor. At the (distributors) site this item is out of stock.\n\nKind Regards\nTom",
		  "ATTRIBUTE_1": 578532,
		  "ATTRIBUTE_2": "N/A",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "tom@consultom.com",
		  "ATTRIBUTE_5": "31628147462",
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Europe",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Consulting",
		  "ATTRIBUTE_10": "IT",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder",
		  "ATTRIBUTE_13": "Quotation or Purchase Consultation",
		  "ATTRIBUTE_14": "N/A",
		  "ATTRIBUTE_15": "IT_Global_LG.com_I2B_Monitor&Other",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-07-04 12:33:56",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-07-04 12:33:56",
		  "ATTRIBUTE_20": "Monitor",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-07-05 03:05:02",
		  "TRANSFER_DATE": "2021-07-05 03:05:02",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-07-05 00:16:35",
		  "CUSTOMOBJECT_ID": 2100962
		}
	]

	// LG전자 개발 GATEWAY URL
	var send_url = "https://dev-apigw-ext.lge.com:7221/gateway/b2bgerp/api2api/leadByEloquaNavG/leadByEloqua.lge";

	let headers = {
		'Content-Type': "application/json",
		'x-Gateway-APIKey' : "da7d5553-5722-4358-91cd-9d89859bc4a0"
	}
	
	let options = {
		url : send_url,
		method: "POST",
		headers:headers,
		body : { ContentList: test_data } ,
		json : true
	};   
	req_res_logs("RequestData" , "TEST" , options.body );
	console.log("test data 전송")
	await request(options, async function (error, response, body) {
		if(error){
			console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
			console.log(error);
			req_res_logs("test_bantsend_error" , "TEST" , error.message );
		} else if(!error && response.statusCode != 200){
			req_res_logs("bantsend_another_error" , "TEST" , response.statusCode );
		}
		if (!error && response.statusCode == 200) {
		 
			req_res_logs("response" , "TEST" , body.resultData );
			// if(test_data && test_data.length) {
			// 	req_res_logs("bantResult" , "TEST" , body.resultData );
			// }     
		}
	});

});

// 스케줄러로 BANT DATA 전송을 전체를 하는게 아닌 특정 사업부만 하기위해서 만듬
router.get('/sender', async function (req, res, next) {
	let start_date = req.query.start_date;
	let end_date = req.query.end_date;
  	bant_send(req.query.bsname , start_date , end_date);
});

//# region Bant 조건 사업부별 contact 데이터 전송을 하는 함수
bant_send = async function(business_name , state_date , end_date ){
	console.log("bant send function BS NAME : " + business_name);
  	//LG전자 개발 URL
	// var send_url = "https://dev-apigw-ext.lge.com:7221/gateway/b2bgerp/api2api/leadByEloquaNavG/leadByEloqua.lge";

	//LG전자 운영 URL
	var send_url = "https://apigw-ext.lge.com:7211/gateway/b2bgerp/api2api/leadByEloquaNavG/leadByEloqua.lge";

    let contact_list = await get_b2bgerp_global_bant_data( business_name , state_date , end_date);

	// console.log(contacts_data);


    if (contact_list != null) {

        // contacts_data : Eloqua 에 Bant 업데이트를 하기 위한 필드
        // request_data : B2B GERP 에 전송할 데이터
        var request_data = await Convert_B2BGERP_GLOBAL_DATA( contact_list, business_name);
        var bant_update_list ;
		if(contact_list) bant_update_list = contact_list.elements;
       

		// console.log(request_data);
		// 사업부별 Eloqua Data 건수 및 실제 전송 건수 로그를 쌓기 위함 (이메일 필터링에 의해 Eloqua Data 건수와 실제 전송 건수 는 다를 수 있음)
		let total_logs = {
			bsname : business_name ,
			search_time : utils.todayDetail_getDateTime(),
			eloqua_total : contact_list && contact_list.total ? contact_list.total : 0,
			convert_total : request_data.length
		}

		
		// reqEloqua : Eloqua Data List , reqConvert : 실제 전송 list , reqTotal : Eloqua Data 건수 및 실제 전송 건수 기록
		req_res_logs("reqEloqua" , business_name , contact_list );
		req_res_logs("reqConvert" , business_name , request_data );
		req_res_logs("reqTotal" , business_name , total_logs );
		

		// MQL Data 전송 전 MQL Data List 를 CustomObject 에 적재하기 위해 데이터 형태 변경
		let mql_customobject_list = await CONVERT_B2BGERP_GLOBAL_CUSTOMOBJECT(request_data);
		
		// MQL Data 전송 전 MQL Data List 를 CustomObject 에 적재 update_mql_data은 customobject 적재값임
		let update_mql_data = await mqldata_to_eloqua_send(mql_customobject_list);

		// CustomObject 에 적재된 MQL DATA를 CUSTOMBOEJCT_ID 고유값을 추가하여 B2B GERP GLOBAL 로 전송 
		let update_data = await mqldata_push_customobjectid(request_data , update_mql_data);
		req_res_logs("reqCustomData" , business_name , update_data );

		var headers = {
            'Content-Type': "application/json",
            'x-Gateway-APIKey' : "da7d5553-5722-4358-91cd-9d89859bc4a0"
        }
        
        options = {
            url : send_url,
            method: "POST",
            headers:headers,
            body : { ContentList: update_data } ,
            json : true
        };

        await request(options, async function (error, response, body) {
            if(error){
                console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
                console.log(error);
				req_res_logs("bantsend_error" , business_name , [] );
            } 
            if (!error && response.statusCode == 200) {
             
				req_res_logs("response" , business_name , body.resultData );
				if(contact_list && contact_list.total) {


					// Bant 전송 후 Eloqua 에 Bant 조건을 초기화 할 때 Subsidiary 가 없는 값은 전송되지 않았기 때문에 제외 한다.
					let bant_update_data = [];
					let not_bant_data = [];
					if(contact_list && contact_list.elements){
						for(const bant_item of contact_list.elements){
							let fieldValues_list = bant_item.fieldValues;
							let subsidiary_data = GetCustomFiledValue(fieldValues_list, 100196);
					
							if(subsidiary_data != '') bant_update_data.push(bant_item);
							else { not_bant_data.push(bant_item)}
						}
					}

					var bant_result_list = await setBant_Update( business_name , bant_update_list );
					req_res_logs("bantUpdateData" , business_name , bant_result_list );
					req_res_logs("NOT_bantUpdateData" , business_name , not_bant_data );
				}     
            }
        });
	}
}

async function mqldata_to_eloqua_send(convert_mql_data){
	let return_list = [];
	let parent_id = 46;
	for(const mqldata of convert_mql_data){
		await b2bkr_eloqua.data.customObjects.data.create(parent_id , mqldata).then((result) => {
			// console.log(result.data);
			return_list.push(result.data);
		}).catch((err) => {
			console.error(err);
			console.error(err.message);
		});
	}

	return return_list;
	
}

function mqldata_push_customobjectid(origin_data , update_data ){
	for(let i = 0; i< origin_data.length ; i++){
		for(const update_item of update_data){
			// console.log("origin contact id : " + origin_data[i].ATTRIBUTE_1);
			// console.log("update contact id : " + update_item.contactId);
			if(origin_data[i].ATTRIBUTE_1 == update_item.contactId ){
				origin_data[i]['CUSTOMOBJECT_ID'] =  update_item.id;
			}
		}
	}

	return origin_data ;
}



function CONVERT_B2BGERP_GLOBAL_CUSTOMOBJECT(request_data){
	let mql_list = [];
	for(const item of request_data){
		let mql_data = {};
		mql_data.fieldValues = [];
		
		mql_data.name = item.ATTRIBUTE_4;
		mql_data.contactId = item.ATTRIBUTE_1;
		mql_data.isMapped = "Yes" ;
		mql_data.type = "CustomObjectData";

		mql_data.fieldValues.push({
			"id": "484" ,
			"value": item.INTERFACE_ID
		}) 

		mql_data.fieldValues.push({
			"id": "485" ,
			"value": item.LEAD_NAME
		}) 

		mql_data.fieldValues.push({
			"id": "486" ,
			"value": item.SITE_NAME
		}) 

		mql_data.fieldValues.push({
			"id": "487" ,
			"value": item.LEAD_SOURCE_NAME
		}) 

		mql_data.fieldValues.push({
			"id": "488" ,
			"value": item.LEAD_SOURCE_TYPE
		}) 

		mql_data.fieldValues.push({
			"id": "489" ,
			"value": item.ENTRY_TYPE
		})

		mql_data.fieldValues.push({
			"id": "490" ,
			"value": item.ACCOUNT
		})

		mql_data.fieldValues.push({
			"id": "491" ,
			"value": item.CONTACT_POINT
		})

		mql_data.fieldValues.push({
			"id": "492" ,
			"value": item.CORPORATION
		})

		mql_data.fieldValues.push({
			"id": "493" ,
			"value": item.OWNER
		})

		mql_data.fieldValues.push({
			"id": "494" ,
			"value": item.CORPORATION
		})

		mql_data.fieldValues.push({
			"id": "495" ,
			"value": item.DESCRIPTION
		})

		mql_data.fieldValues.push({
			"id": "496" ,
			"value": item.ATTRIBUTE_1
		})

		mql_data.fieldValues.push({
			"id": "497" ,
			"value": item.ATTRIBUTE_2
		})

		mql_data.fieldValues.push({
			"id": "498" ,
			"value": item.ATTRIBUTE_3
		})

		mql_data.fieldValues.push({
			"id": "499" ,
			"value": item.ATTRIBUTE_4
		})

		mql_data.fieldValues.push({
			"id": "500" ,
			"value": item.ATTRIBUTE_5
		})

		mql_data.fieldValues.push({
			"id": "501" ,
			"value": item.ATTRIBUTE_6
		})

		mql_data.fieldValues.push({
			"id": "502" ,
			"value": item.ATTRIBUTE_7
		})

		mql_data.fieldValues.push({
			"id": "503" ,
			"value": item.ATTRIBUTE_8
		})

		mql_data.fieldValues.push({
			"id": "504" ,
			"value": item.ATTRIBUTE_9
		})

		mql_data.fieldValues.push({
			"id": "505" ,
			"value": item.ATTRIBUTE_10
		})

		mql_data.fieldValues.push({
			"id": "506" ,
			"value": item.ATTRIBUTE_11
		})

		mql_data.fieldValues.push({
			"id": "507" ,
			"value": item.ATTRIBUTE_12
		})

		mql_data.fieldValues.push({
			"id": "508" ,
			"value": item.ATTRIBUTE_13
		})

		mql_data.fieldValues.push({
			"id": "509" ,
			"value": item.ATTRIBUTE_14
		})

		mql_data.fieldValues.push({
			"id": "510" ,
			"value": item.ATTRIBUTE_15
		})

		mql_data.fieldValues.push({
			"id": "511" ,
			"value": item.ATTRIBUTE_16
		})

		mql_data.fieldValues.push({
			"id": "521" ,
			"value": utils.timeConverter("GET_UNIX" , item.ATTRIBUTE_17) 
		})

		mql_data.fieldValues.push({
			"id": "513" ,
			"value": item.ATTRIBUTE_18
		})

		mql_data.fieldValues.push({
			"id": "520" ,
			"value": utils.timeConverter("GET_UNIX" , item.ATTRIBUTE_19) 
		})

		mql_data.fieldValues.push({
			"id": "515" ,
			"value": item.ATTRIBUTE_20
		})

		mql_data.fieldValues.push({
			"id": "516" ,
			"value": item.ATTRIBUTE_21
		})

		mql_data.fieldValues.push({
			"id": "517" ,
			"value": item.ATTRIBUTE_22
		})

		mql_data.fieldValues.push({
			"id": "518" ,
			"value": item.ATTRIBUTE_23
		})

		mql_data.fieldValues.push({
			"id": "519" ,
			"value": utils.timeConverter("GET_UNIX" , item.REGISTER_DATE) 
		})

		mql_data.fieldValues.push({
			"id": "522" ,
			"value": utils.timeConverter("GET_UNIX" , item.TRANSFER_DATE)
		})

		mql_data.fieldValues.push({
			"id": "523" ,
			"value": item.TRANSFER_FLAG
		})

		mql_data.fieldValues.push({
			"id": "524" ,
			"value": utils.timeConverter("GET_UNIX" , item.LAST_UPDATE_DATE)
		});
	
		mql_list.push(mql_data);
	}

	return mql_list;
}

router.get('/search_gerp_data', async function (req, res, next) {
	let Business_Unit_List = [];
	let bsname = req.query.bsname;
	let getStatus = req.query.status;
	let start_date = req.query.start_date;
	let end_date = req.query.end_date;
	console.log("search_gerp_data");

	
	console.log(bsname);
	console.log(getStatus);
	
	let bant_data = await get_b2bgerp_global_bant_data(bsname , start_date , end_date);
	let convert_data = await Convert_B2BGERP_GLOBAL_DATA( bant_data, bsname)

	let bant_update_data = [];
	let not_bant_data = [];
	if(bant_data && bant_data.elements){
		for(const bant_item of bant_data.elements){
			let fieldValues_list = bant_item.fieldValues;
			let subsidiary_data = GetCustomFiledValue(fieldValues_list, 100196);
	
			if(subsidiary_data != '') bant_update_data.push(bant_item);
			else { not_bant_data.push(bant_item)}
		}
	}
	

	if(bant_data && getStatus == 'eloqua') res.json(bant_data);
	else if(bant_data && getStatus == 'convert')res.json(convert_data);
	else  res.json(false)

	// 요청에 대한 로그를 쌓기 위함
	let total_logs = {
		bsname : bsname ,
		search_time : utils.todayDetail_getDateTime(),
		eloqua_total : bant_data && bant_data.total ? bant_data.total : 0,
		convert_total : convert_data ? convert_data.length : null
	}

	if(bant_data){
		req_res_logs("reqEloqua" , bsname , bant_data );
		req_res_logs("reqConvert" , bsname , convert_data );
		req_res_logs("reqUpdate" , bsname , bant_update_data );
		req_res_logs("reqNOT_Update" , bsname , not_bant_data );
		req_res_logs("reqTotal" , bsname , total_logs );
	}
	
});

router.put('/menual_bant_update', async function (req, res, next) {
	console.log("menual_bant_update");
	
	req_res_logs("reqEloqua" , req.body.bsname  , req.body.elements );
	
});

function req_res_logs(filename , business_name , data){
	// filename : request , response 
	// business_name : 사업부별 name
	// data : log 저장할 데이터

	var today = moment().format("YYYY-MM-DD"); 
	var dirPath = utils.logs_makeDirectory(today );
	console.log("fileWrite Path : " + dirPath);

	fs.writeFile(dirPath + filename + "_" + business_name + ".txt", JSON.stringify(data), 'utf8', function(error){ 
		if(error) {
			console.log(err);
		}else{
			console.log('write end') ;
		}
	});
}



//전 사업부별(AS , ID , CM ...)  MQL 리스트를 사업부별로 조회하는 function - 확인용
router.get('/search_gerp_data', async function (req, res, next) {
	let Business_Unit_List = [];
	let bsname = req.query.bsname;
	let getStatus = req.query.status;
	let start_date = req.query.start_date;
	let end_date = req.query.end_date;
	console.log("search_gerp_data");

	
	console.log(bsname);
	console.log(getStatus);
	
	let bant_data = await get_b2bgerp_global_bant_data(bsname , start_date , end_date);
	let convert_data = await Convert_B2BGERP_GLOBAL_DATA( bant_data, bsname)


	if(bant_data && getStatus == 'eloqua') res.json(bant_data);
	else if(bant_data && getStatus == 'convert')res.json(convert_data);
	else  res.json(false)

	// 요청에 대한 로그를 쌓기 위함
	let total_logs = {
		bsname : bsname ,
		search_time : utils.todayDetail_getDateTime(),
		eloqua_total : bant_data && bant_data.total ? bant_data.total : 0,
		convert_total : convert_data ? convert_data.length : null
	}

	if(bant_data){
		req_res_logs("reqEloqua" , bsname , bant_data );
		req_res_logs("reqConvert" , bsname , convert_data );
		req_res_logs("reqTotal" , bsname , total_logs );
	}
	
});

// 만약 Eloqua Contact 의 기본 정보 (standard field 정보를 안넣고 업데이트 하면 정보가 날라간다.)를 
// 다시 업데이트 하기 위해 에전에 조회된 Eloqua 데이터를 바탕으로 업데이트 하는 펑션
router.put('/menual_bant_update', async function (req, res, next) {
	console.log("menual_bant_update");
	
	req_res_logs("reqEloqua" , req.body.bsname  , req.body.elements );
	
});


// router.post('/leadNumberAPI', async function (req, res, next) {
// 	let lead_list = req.body;
// 	let CustomObject_lead_id = 46 
// 	for(let i = 0 ; i < lead_list.length ; i ++){
// 		await b2bkr_eloqua.data.customObjects.data.create(CustomObject_lead_id, _customObjectCreateData).then((result) => {
// 			console.log(result);
// 			return_data = result;
// 		}).catch((err) => {
// 			console.error(err);
// 			console.error(err.message);
// 			return_data = err.message;
// 		});
// 		return return_data;
// 	}
// });

router.get('/leadResponse' , async function(req , res, next){
	console.log(123)
	
	res.json({ ContentList : [
		{
			"LeadNumber" : 0 ,
		  "CUSTOMOBJECT_ID": "2094552"
		},
		{
			"LeadNumber" : 1 , 
		  "CUSTOMOBJECT_ID": "2094553"
		},
		{
			"LeadNumber" : 2 , 
		  "CUSTOMOBJECT_ID": "2094554"
		},
		{
			"LeadNumber" : 3 ,
		  "CUSTOMOBJECT_ID": "2094555"
		},
		{
			"LeadNumber" : 4 , 
		  "CUSTOMOBJECT_ID": "2094556"
		},
		{
			"LeadNumber" : 5 ,
		  "CUSTOMOBJECT_ID": "2094557"
		},
		{
			"LeadNumber" : 6 , 
		  "CUSTOMOBJECT_ID": "2094558"
		},
		{
			"LeadNumber" : 7 , 
		  "CUSTOMOBJECT_ID": "2094559"
		},
		{
			"LeadNumber" : 8 ,
		  "CUSTOMOBJECT_ID": "2094560"
		},
		{
			"LeadNumber" : 9,
		  "CUSTOMOBJECT_ID": "2094561"
		},
		{
			"LeadNumber" : 10 ,
		
		  	"CUSTOMOBJECT_ID": "2094562"
		}
	  ]
	})
});

router.post('/leadNumberAPI', async function (req, res, next) {
	
	let LeadNumberData_list = await getLeadnumberData();
	let parent_id = 46;


	// 생성된 데이터를 customobject 에 적재함
	let convert_data_list = ConvertCustomObjectData(LeadNumberData_list);
	console.log(convert_data_list[0].fieldValues);

	let return_data = [];
	
	for(let i = 0 ; i < convert_data_list.length ; i++){
		await b2bgerp_eloqua.data.customObjects.data.update(parent_id , convert_data_list[i].id, convert_data_list[i]).then((result) => {
			console.log(result);
			return_data.push({
				cod_id :  convert_data_list[i].id,
				contactId : convert_data_list[i].contactId,
				message : "Success"	
			})
		}).catch((err) => {
			console.error(err);
			console.error(err.message);
			return_data.push({
				cod_id :  convert_data_list[i].id,
				contactId : convert_data_list[i].contactId,
				message : err.message
			})
		});
	}
	res.json({ContentList : return_data});
});

async function getLeadnumberData(){
	console.log("leadNumberAPI");
	// console.log(req.body);

	let CustomObject_lead_id = 46;
	
	// MAT 에서 B2B GERP GLOBAL 을 일배치로 호출해서 데이터를 가져옴
	// var headers = {
	// 	'Content-Type': "application/json",
	// 	'x-Gateway-APIKey' : "da7d5553-5722-4358-91cd-9d89859bc4a0"
	// }

	var headers = {
		'Content-Type': "application/json"
	}

	let b2bgerp_global_url = "http://localhost:8001/b2bgerp_global/contacts/leadResponse";

	options = {
		url : b2bgerp_global_url,
		headers:headers,
		body : {} ,
		json : true
	};

	let data_list ;
	await request_promise.get(options, function (error, response, body) {

		// console.log(11);
		// console.log(response);
		
		if(error){
			console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
			console.log(error);
			let errorData = {
				errorCode : response.statusCode,
				errorMsg : error.Message 
			}
			req_res_logs("Response" , "LeadnumberAPI_Error" , errorData );	
		}else if(!error && response.statusCode != 200 ){
			let errorData = {
				errorCode : response.statusCode,
				errorMsg : error.Message 
			}
			req_res_logs("Response" , "LeadnumberAPI_Error" , errorData );
		}else if (!error && response.statusCode == 200) {
			req_res_logs("Response" , "LeadnumberAPI" , body.ContentList );

			data_list = body.ContentList;
			// console.log(body.resultData);
		}
	});

	return data_list;
}


//커스텀 오브젝트 데이터 형태로 변경 함수
function ConvertCustomObjectData( data_list ) {

	let convert_list = [];

	for(let i = 0 ; i < data_list.length ; i ++ ){
		let this_data = {};

		this_data.fieldValues = [];

		this_data.id = data_list[i].CUSTOMOBJECT_ID ;
		this_data.isMapped = "Yes";
		this_data.type = "CustomObjectData";

		this_data.fieldValues.push({
			"id": "525",
			"value": data_list[i].LeadNumber
		}); // EmailAddress
		this_data.fieldValues.push({
			"id": "526",
			"value": utils.timeConverter( "GET_UNIX" , data_list[i].LeadCreateDate)
		}); //Leadnumber 생성일

		convert_list.push(this_data);
	}
	return convert_list;
}

// 2021 08 09 잘못넘어간 데이터 건에 대하여 파일로 떨구기
router.get('/get_test', async function (req, res, next) {
	let folder_list = ["2021-06-24" , "2021-07-08" , "2021-07-22" , "2021-07-23" , "2021-07-24" , "2021-07-25" , "2021-07-26" , "2021-07-27" , "2021-07-28" , "2021-07-29" , "2021-07-30" , "2021-08-02" ] 


	for(const folder_name of folder_list){
		await fs.readFile('./Index.html', function read(err, data) {
			if (err) {
				throw err;
			}
			content = data;
		});
	}
	
	
	return;
	let data_list = [
		{
		  "ContactID": 574083,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 579409,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 579410,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 579411,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 579412,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 580708,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583726,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583729,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583737,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583738,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583742,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583743,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583745,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583747,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583748,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583749,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583750,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583751,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583752,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583753,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583754,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583755,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583757,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583759,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583760,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583761,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583762,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583763,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583764,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583765,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583766,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583767,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583769,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583770,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583771,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583772,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583773,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583774,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583776,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583777,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583778,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583779,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583782,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583783,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583784,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583786,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583787,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583789,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583790,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583791,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583792,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583793,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583794,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583795,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583796,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583797,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583798,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583799,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583800,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583801,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583802,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583803,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583804,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583805,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583806,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583807,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583808,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583809,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583810,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583811,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583812,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583813,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583814,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583815,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583816,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583817,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583818,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583819,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583821,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583822,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583823,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583824,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583825,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 583826,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 584382,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584383,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584384,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584385,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584386,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584387,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584388,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584389,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584390,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584391,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584392,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584393,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584394,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584395,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584396,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584397,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584398,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584399,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584400,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584401,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584402,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584404,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584405,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584406,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584407,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584408,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584409,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584411,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584412,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584413,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584414,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584415,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584416,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584417,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584418,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584419,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584420,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584422,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584423,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584424,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584425,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584426,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584427,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584428,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584429,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584430,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584431,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584432,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584445,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584448,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584500,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584547,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 584656,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585067,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585200,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585201,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585202,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585204,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585207,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585213,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585214,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585216,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585217,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585218,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585221,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585222,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585223,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585229,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585230,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585231,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585232,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585233,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585234,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585235,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585236,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585237,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585238,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585239,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585240,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585241,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585242,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585243,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585244,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585245,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585246,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585247,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585248,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585249,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585250,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585251,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585252,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585253,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585254,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585255,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585256,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585257,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585258,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585260,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585264,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585265,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585270,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585271,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585272,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585273,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585274,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585275,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585281,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585283,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585285,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585286,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585287,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585290,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585291,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585292,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585297,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585298,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585302,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585305,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585306,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585307,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585309,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585313,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585316,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585317,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585318,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585321,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585322,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585323,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585327,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585328,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585331,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585333,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585335,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585336,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585339,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585340,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585341,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585342,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585347,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585349,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 585352,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585354,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585357,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585358,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585359,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585361,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585362,
		  "BusinessUnit": "IT"
		},
		{
		  "ContactID": 585364,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585366,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585367,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585368,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585369,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585370,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585372,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585376,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585378,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585381,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585382,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585383,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585384,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585386,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585387,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585388,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585390,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585391,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585396,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585397,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585398,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585399,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585403,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585404,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585405,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585407,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585408,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585409,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585412,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585413,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 585414,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585415,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585416,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585419,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585420,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585421,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585422,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585424,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585425,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585426,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585429,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585430,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585434,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585435,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585436,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585437,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585441,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585442,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585443,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585444,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585445,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585446,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585447,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585448,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585449,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585450,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585451,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585452,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585453,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585454,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585455,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585456,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585457,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585458,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585459,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585460,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585461,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585462,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585464,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585465,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585466,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585467,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585469,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585470,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585471,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585472,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585473,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585477,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585478,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585479,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585480,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585481,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585483,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585486,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585487,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585488,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585490,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585492,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585493,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585494,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585495,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585496,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585497,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585498,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585499,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585500,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585501,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585502,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585503,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585504,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585505,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585508,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585509,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 585510,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585511,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585513,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585514,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585516,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 585519,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585521,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585522,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585523,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585524,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585525,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585526,
		  "BusinessUnit": "IT"
		},
		{
		  "ContactID": 585529,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585530,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585531,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585617,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585618,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585620,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585621,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585626,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585627,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585628,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585631,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585632,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585633,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585635,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585636,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585638,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585640,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585641,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585642,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585643,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585644,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585645,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585646,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585658,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585659,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585664,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585667,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585672,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585673,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585677,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585681,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585682,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585684,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585686,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585687,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585688,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585689,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585690,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585692,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585697,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585698,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585700,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585701,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585702,
		  "BusinessUnit": "IT"
		},
		{
		  "ContactID": 585707,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585709,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585710,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585719,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585721,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585731,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 585732,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585733,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585740,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585741,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585742,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585748,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585751,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585754,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585755,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585756,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585758,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585763,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585765,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585766,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585769,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585771,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585773,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585776,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585777,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585780,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585781,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585782,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585783,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585785,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585787,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585788,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585789,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585790,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585792,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585793,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585795,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585797,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585799,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585803,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585807,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585808,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585809,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585810,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585812,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585815,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585823,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585824,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 585825,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585826,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585829,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585830,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585832,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585833,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585836,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585837,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585838,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585839,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585840,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585842,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585843,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585844,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585846,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585847,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585848,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585849,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585850,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585851,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585852,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585853,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585854,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585856,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585858,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585859,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585860,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585862,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585863,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585865,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585866,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585867,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585868,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585869,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585870,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585872,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585873,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585874,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585875,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585876,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585877,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585878,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585879,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585880,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585881,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585882,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585883,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585884,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585885,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585886,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585887,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585888,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585889,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585890,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585891,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585894,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585895,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585896,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585897,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585899,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585900,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585901,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585938,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585939,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585941,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585943,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585944,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585945,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585953,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585957,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585959,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585960,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585961,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585963,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585964,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585966,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585967,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585970,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585973,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585975,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585978,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585982,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585984,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 585985,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585986,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585987,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585990,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585991,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585992,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585993,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585994,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585995,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585996,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 585997,
		  "BusinessUnit": "IT"
		},
		{
		  "ContactID": 585998,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586000,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586002,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586003,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586005,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586007,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586008,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586009,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586010,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586011,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586012,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586013,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586014,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586015,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586016,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586017,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586018,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586019,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586021,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586026,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586027,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586028,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586029,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586031,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586032,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586033,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586035,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586036,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586037,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586038,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586040,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586041,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586042,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586043,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586044,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586045,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586046,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586048,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586052,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586053,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586054,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586058,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586059,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586060,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586061,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586065,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586070,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 586074,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586077,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586079,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586080,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586081,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586084,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586085,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586087,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586088,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586098,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586099,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586100,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586103,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586105,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586106,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586107,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586108,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586109,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586110,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586111,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586112,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586113,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586114,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586115,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586116,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586117,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586118,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586119,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586120,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586126,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586127,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586128,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586136,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586145,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586146,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586151,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586152,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586153,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586154,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586155,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586156,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586157,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586158,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586159,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586160,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586161,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586162,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586163,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586164,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586165,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586166,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586167,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586168,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586169,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586170,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586171,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586172,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586173,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586174,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586175,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586176,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586177,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586178,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586179,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586180,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586181,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586182,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586183,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586184,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586185,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586186,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586187,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586188,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586189,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586190,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586191,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586192,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586193,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586194,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586195,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586196,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586197,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586198,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586199,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586200,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586201,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586202,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586203,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586204,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586205,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586206,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586207,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586208,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586209,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586210,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586211,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586212,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586213,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586214,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586215,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586216,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586217,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586219,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586220,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586221,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586226,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586227,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586228,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586229,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586231,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586232,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586233,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586234,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586235,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586236,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586237,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586238,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586239,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586240,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586241,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586242,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586243,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586244,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586245,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586246,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586247,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586248,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586249,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586250,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586251,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586252,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586253,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586254,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586255,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586256,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586257,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586258,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586259,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586260,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586261,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586262,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586263,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586264,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586265,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586266,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586267,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586268,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586269,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586270,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586271,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586272,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586273,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586274,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586275,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586276,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586277,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586278,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586279,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586280,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586281,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586282,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586283,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586284,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586285,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586286,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586287,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586288,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586289,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586290,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586291,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586292,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586293,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586294,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586295,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586296,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586297,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586298,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586299,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586300,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586301,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586302,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586303,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586304,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586305,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586306,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586307,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586308,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586309,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586310,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586311,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586312,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586313,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586314,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586315,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586316,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586317,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586318,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586319,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586320,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586321,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586322,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586323,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586324,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586325,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586326,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586327,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586328,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586329,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586330,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586331,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586332,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586333,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586334,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586335,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586336,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586337,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586338,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586339,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586340,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586341,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586342,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586343,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586344,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586345,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586346,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586347,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586348,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586349,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586350,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586351,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586352,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586353,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586354,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586355,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586356,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586357,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586358,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586359,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586360,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586361,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586362,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586363,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586364,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586365,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586366,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586367,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586368,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586369,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586370,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586371,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586372,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586373,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586374,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586375,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586376,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586377,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586378,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586379,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586380,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586381,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586382,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586383,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586384,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586388,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586389,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586390,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586391,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586393,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586398,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586399,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586400,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586401,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586403,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586404,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586405,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586406,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586407,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586408,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586409,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586410,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586411,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586412,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586413,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586414,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586415,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586416,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586417,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586418,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586419,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586420,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586421,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586422,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586423,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586424,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586425,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586426,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586427,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586428,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586429,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586430,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586431,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586432,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586433,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586434,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586435,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586436,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586437,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586438,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586439,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586440,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586441,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586442,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586443,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586444,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586445,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586446,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586447,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586448,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586449,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586450,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586451,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586452,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586453,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586454,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586455,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586456,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586457,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586458,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586459,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586460,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586461,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586462,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586463,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586464,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586465,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586466,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586468,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586470,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586471,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 586475,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586476,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586480,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586482,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586483,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586488,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586489,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586490,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 586495,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586499,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586500,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586501,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586512,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586513,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586515,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586516,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586519,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586520,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586524,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586525,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586528,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586530,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586531,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586532,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586533,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586534,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586535,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586536,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586537,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586540,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586541,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586542,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586544,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586545,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586546,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586547,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586548,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586549,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586550,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586551,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586553,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586556,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586557,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586558,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586559,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586560,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586561,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586562,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586563,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586564,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586565,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586566,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586568,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586569,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586570,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586571,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586572,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586573,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586574,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586575,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586576,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586578,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 586579,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586580,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586582,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586583,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 586584,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586586,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586587,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586588,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586590,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586591,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586592,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586594,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586595,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586596,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586597,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586600,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586603,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586605,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586606,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586607,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586608,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586610,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586611,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586612,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586613,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586614,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586615,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586616,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586617,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586618,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586619,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586620,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586621,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586622,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586623,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586624,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586625,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586626,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586627,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586628,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586629,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586630,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586631,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586632,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586633,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586634,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586635,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586636,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586637,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586638,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586639,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586640,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586641,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586642,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586643,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586644,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586645,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586646,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586647,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586648,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586649,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586650,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586651,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586652,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586653,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586654,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586655,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586656,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586657,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586658,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586659,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586660,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586661,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586662,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586663,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586664,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586665,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586666,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586667,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586668,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586669,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586670,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586671,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586672,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586673,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586674,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586675,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586676,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586677,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586678,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586679,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586680,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586681,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586682,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586683,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586684,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586685,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586686,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586687,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586688,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586689,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586690,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586691,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586692,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586693,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586694,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586695,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586696,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586697,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586698,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586699,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586700,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586701,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586702,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586703,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586704,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586705,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586706,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586707,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586708,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586709,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586710,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586711,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586712,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586713,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586714,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586715,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586716,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586717,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586718,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586719,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586721,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586722,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586723,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586726,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586727,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586728,
		  "BusinessUnit": "IT"
		},
		{
		  "ContactID": 586730,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586735,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586738,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586740,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586742,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586743,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586745,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586748,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586749,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586751,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586753,
		  "BusinessUnit": "AS"
		},
		{
		  "ContactID": 586755,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586758,
		  "BusinessUnit": "Solar"
		},
		{
		  "ContactID": 586762,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586763,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586764,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586768,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586769,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586770,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586774,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586950,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586951,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586952,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586953,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586954,
		  "BusinessUnit": "ID"
		},
		{
		  "ContactID": 586955,
		  "BusinessUnit": "ID"
		}
	   ]

	   let queryString = {
		   depth : "complete"
	   }
		let request_list = []
		for(const item of data_list){
			await bscard_eloqua.data.contacts.getOne(item.ContactID , queryString).then( async (result) => {
				console.log(result.data);
				let result_data = await Convert_TEST_B2BGERP_GLOBAL_DATA(result.data , item.BusinessUnit)
				if(result_data && result_data != null)request_list.push(result_data);
				// res.json(true);
			}).catch((err) => {
				console.error(err);
				res.json(false);
			});
		}

		res.json(request_list);
		req_res_logs("TestGetData_Convert" , "TEST" , request_list);
	}
)

//Eloqua Data B2B GERP Global Mapping 데이터 생성
function Convert_TEST_B2BGERP_GLOBAL_DATA(contacts_data, business_department) {

  if(!contacts_data)  return;
  var result_item = new B2B_GERP_GLOBAL_ENTITY();
	  try {

		  
		  var FieldValues_data = contacts_data.fieldValues;

		  //result_item.INTERFACE_ID = "ELOQUA_0003" // this.INTERFACE_ID = "ELOQUA_0003"

		  var business_interface_num = 0;
		  switch(business_department){
			  case "AS": business_interface_num = 1; break;
			  case "CLS": business_interface_num = 2; break;
			  case "CM": business_interface_num = 3; break;
			  case "ID": business_interface_num = 4; break;
			  case "IT": business_interface_num = 5; break;
			  case "Solar": business_interface_num = 6; break;
			  case "Solution": business_interface_num = 7; break;
			  case "TEST": business_interface_num = 1; break;
			  default : business_interface_num = 0; break;
		  }

		  result_item.INTERFACE_ID = moment().format('YYYYMMDD') + business_interface_num + lpad(seq_cnt, 5, "0");
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
	  
		  result_item.SITE_NAME = GetCustomFiledValue(FieldValues_data, 100187) == "" ? "N/A" : GetCustomFiledValue(FieldValues_data, 100187);        //100187	Territory //SITE_NAME ( 현장명 매핑필드 확인 ) //2021-02-02 기준 데이터 없음
		  result_item.LEAD_SOURCE_TYPE = "11";                                          //default 11 (협의됨) //Eloqua에서 넘어오는 값이면 By Marketing, 영업인원이 수기입할 경우 By Sales로 지정

		  result_item.LEAD_SOURCE_NAME = GetCustomFiledValue(FieldValues_data, 100202) == "" ? "N/A" : GetCustomFiledValue(FieldValues_data, 100202); //리드소스 네임 Platform&Activity 필드 매핑 // 폼에 히든값으로 존재

		  result_item.ENTRY_TYPE = "L"                                                  //default L
		  result_item.ACCOUNT = GetDataValue(contacts_data.accountName) == "" ? "N/A" : GetDataValue(contacts_data.accountName);    //ACCOUNT ( 회사 )  // Company Name
		  result_item.CONTACT_POINT =
		  GetCustomFiledValue(FieldValues_data, 100172) + "/" +
		  //GetDataValue(contacts_data.elements[i].firstName) + " " + GetDataValue(contacts_data.elements[i].lastName) + "/" +
		  GetDataValue(contacts_data.emailAddress) + "/" +
		  GetDataValue(contacts_data.mobilePhone);                        //Contact Point는 Eloqua 필드 중 -> Customer Name/Email/Phone No. 를 연결 시켜 매핑 필요
		  result_item.CORPORATION = "LGE" + GetCustomFiledValue(FieldValues_data, 100196);  //법인정보 "LGE" + {{Subsidiary}}
		  result_item.OWNER = "";                                                       //(확인필요);
		  
		  
		  let address = "";
		  address += GetDataValue(contacts_data.address1);
		  if(address != "") address += " " + GetDataValue(contacts_data.address2);
		  if(address != "") address += " " + GetDataValue(contacts_data.address3);
		  address += "/" + GetDataValue(contacts_data.city) + "/"  + GetDataValue(contacts_data.country);	//주소정보 Address1 + Address2 + Address3 // Inquiry To Buy 주소 입력 없음



		  result_item.ADDRESS = address;
		  //result_item.DESCRIPTION = GetDataValue(contacts_data.elements[i].description);//설명 Comments, message, inquiry-to-buy-message 필드 중 하나 (확인필요) //DESCRIPTION
		  let description = GetCustomFiledValue(FieldValues_data, 100209);
		  result_item.DESCRIPTION = description.length >= 1500 ? description.substring(0,1675) : description ;      //설명 inquiry-to-buy-message 필드

		  result_item.ATTRIBUTE_1 = GetDataValue(contacts_data.id);         //Eloqua Contact ID
		  result_item.ATTRIBUTE_2 = GetBusiness_Department_data(FieldValues_data, business_department, "Budget"); //PRODUCT LV1의 BU 별 
		  result_item.ATTRIBUTE_3 = GetBusiness_Department_data(FieldValues_data, business_department, "Vertical_Level_2"); //Vertical Level 2
		  result_item.ATTRIBUTE_4 = GetDataValue(contacts_data.emailAddress);   //이메일
		  result_item.ATTRIBUTE_5 = GetDataValue(contacts_data.mobilePhone);    //전화번호 (businessPhone 확인필요)
		  result_item.ATTRIBUTE_6 = "";                                                     //(확인필요)
		  result_item.ATTRIBUTE_7 = GetCustomFiledValue(FieldValues_data, 100069);          //지역 - 국가 eloqua filed 정보
		  result_item.ATTRIBUTE_8 = "";
		  result_item.ATTRIBUTE_9 = GetBusiness_Department_data(FieldValues_data, business_department, "Job Function"); //(Job Function 사업부별 컬럼 확인 필요)
		  result_item.ATTRIBUTE_10 = business_department; //(Business Unit 가장 최근 기준 BU값)
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
		  result_item.TRANSFER_FLAG = "Y";	 									//TRANSFER_FLAG N , Y 값의 용도 확인 필요
		  result_item.LAST_UPDATE_DATE = utils.timeConverter("GET_DATE", contacts_data.updatedAt);



		 
			  // for(let k = 0 ; notBant_emailType_List.length > k ; k++){
			  // 	let notBant_item = notBant_emailType_List[k];
			  // 	notBant_item
			  // }
		  // console.log(notBant_email_list.length);
		
		  }catch (e) {
		  console.log(e);
	  }

	  let notBant_emailType_List = ["@lg.com", "@lge.com" , "@goldenplanet.co.kr" , "@test.com" , "@cnspartner.com", "@intellicode.co.kr" , "@hsad.co.kr" , "@test.co.kr", "@test.test", "@testtest.com"];
	  // let notBant_emailType_List = ["@goldenplanet.co.kr"];
	  let notBant_email_list  = notBant_emailType_List.filter(function (sentence) { 
		  return result_item.ATTRIBUTE_4.indexOf( sentence ) > -1 ? result_item.ATTRIBUTE_4 : null ; });

	  
	    
	  if( result_item.CORPORATION != "" && result_item.CORPORATION != "LGE" && notBant_email_list.length < 1 ){
		return result_item;
	  }
	  
	
	 
 
}

module.exports = router;
module.exports.bant_send = bant_send;