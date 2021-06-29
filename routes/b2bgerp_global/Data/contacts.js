var express = require('express');
var router = express.Router();
var request = require('request');
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

// 가상의 LG API GATEWAY의 
router.get('/bant_test/', async function (req, res, next) {
  	await httpRequest.sender("http://localhost:8010/restfulApi/eloqua", "GET", {});
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

	// 테스트용 데이터 반드시 지워야 함
	
    // if (contact_list != null) {

        // contacts_data : Eloqua 에 Bant 업데이트를 하기 위한 필드
        // request_data : B2B GERP 에 전송할 데이터
        var request_data = await Convert_B2BGERP_GLOBAL_DATA( contact_list, business_name);
        var bant_update_list ;
		if(contact_list) bant_update_list = contact_list.elements;
        var headers = {
            'Content-Type': "application/json",
            'x-Gateway-APIKey' : "da7d5553-5722-4358-91cd-9d89859bc4a0"
        }
        
        options = {
            url : send_url,
            method: "POST",
            headers:headers,
            body : { ContentList: request_data } ,
            json : true
        };

		// 테스트용 데이터 반드시 지워야 함
		request_data = await getLeadnumberData();

		// 사업부별 Eloqua Data 건수 및 실제 전송 건수 로그를 쌓기 위함 (이메일 필터링에 의해 Eloqua Data 건수와 실제 전송 건수 는 다를 수 있음)
		let total_logs = {
			bsname : business_name ,
			search_time : utils.todayDetail_getDateTime(),
			eloqua_total : contact_list && contact_list.total ? contact_list.total : 0,
			convert_total : request_data.length
		}

		// reqEloqua : Eloqua Data List , reqConvert : 실제 전송 list , reqTotal : Eloqua Data 건수 및 실제 전송 건수 기록
		// req_res_logs("reqEloqua" , business_name , contact_list );
		// req_res_logs("reqConvert" , business_name , request_data );
		// req_res_logs("reqTotal" , business_name , total_logs );
		


		


		// MQL Data 전송 전 MQL Data List 를 CustomObject 에 적재하기 위해 데이터 형태 변경
		let mql_customobject_list = await CONVERT_B2BGERP_GLOBAL_CUSTOMOBJECT(request_data);
		req_res_logs("reqCustomData" , business_name , mql_customobject_list );
		// MQL Data 전송 전 MQL Data List 를 CustomObject 에 적재
		let update_mql_data = await mqldata_to_eloqua_send(mql_customobject_list);

		// let update_data = await mqldata_push_customobjectid(request_data , update_mql_data);

		return;
        await request(options, async function (error, response, body) {

            // console.log(11);
            // console.log(response);
            if(error){
                console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
                console.log(error);
				req_res_logs("bantsend_error" , business_name , [] );
            } 
            if (!error && response.statusCode == 200) {
             
				req_res_logs("response" , business_name , body.resultData );
				if(contact_list && contact_list.total) {
					var bant_result_list = await setBant_Update( business_name , bant_update_list );
					req_res_logs("bantResult" , business_name , bant_result_list );
				}     
            }
        });
        

}

async function mqldata_to_eloqua_send(convert_mql_data){
	let return_data = undefined;
	let parent_id = 46;
	for(const mqldata of convert_mql_data){
		await b2bkr_eloqua.data.customObjects.data.create(parent_id, mqldata).then((result) => {
			console.log(result);
			return_data = result;
		}).catch((err) => {
			console.error(err);
			console.error(err.message);
			return_data = err.message;
		});
	}

	return return_data;
	
}

// function mqldata_push_customobjectid(origin_data , update_data ){
// 	for(let i = 0; i< origin_data.length ; i++){

// 		for(const update_item of update_data){
// 			if(origin_data[i].ATTRIBUTE_1 === update_item.ATTRIBUTE_1 ){
// 				origin_data[i].CUSTOMOBJECT_ID = update_item.
// 			}
// 		}
// 	}
// }



function CONVERT_B2BGERP_GLOBAL_CUSTOMOBJECT(request_data){
	let mql_list = [];
	for(const item of request_data){
		let mql_data = {};
		mql_data.fieldValues = [];
		
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
			"value": item.ATTRIBUTE_17
		})

		mql_data.fieldValues.push({
			"id": "513" ,
			"value": item.ATTRIBUTE_18
		})

		mql_data.fieldValues.push({
			"id": "520" ,
			"value": item.ATTRIBUTE_19
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
			"value": item.REGISTER_DATE
		})

		mql_data.fieldValues.push({
			"id": "522" ,
			"value": item.TRANSFER_DATE
		})

		mql_data.fieldValues.push({
			"id": "523" ,
			"value": item.TRANSFER_FLAG
		})

		mql_data.fieldValues.push({
			"id": "524" ,
			"value": item.LAST_UPDATE_DATE
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

router.post('/leadResponse' , async function(req , res, next){
	console.log(123)
	
	res.json({ ContentList : [
		{
		  "INTERFACE_ID": 20210411100065,
		  "LEAD_NAME": "[MQL]IL_AS_LG.com_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Individual ",
		  "CONTACT_POINT": "Rajesh Mukkala/rajesh.mukkala@gmail.com/9986072499",
		  "CORPORATION": "LGEIL",
		  "OWNER": "",
		  "ADDRESS": "/India",
		  "DESCRIPTION": "Please connect with me",
		  "ATTRIBUTE_1": 544259,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "rajesh.mukkala@gmail.com",
		  "ATTRIBUTE_5": 9986072499,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_Global_Asia_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 02:21:16",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 02:21:16",
		  "ATTRIBUTE_20": "Multi-Split",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:08:29"
		},
		{
		  "INTERFACE_ID": 20210411100066,
		  "LEAD_NAME": "[MQL]IL_AS_LG.com_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "SREE SIDDHIVINAYAK ENTERPRISE",
		  "CONTACT_POINT": "KOMMARAJU NARASIMHA RAO/kommaraju14@gmail.com/9515441707",
		  "CORPORATION": "LGEIL",
		  "OWNER": "",
		  "ADDRESS": "/India",
		  "DESCRIPTION": "I Want Bulk Products Please contact Urgent",
		  "ATTRIBUTE_1": 544260,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "kommaraju14@gmail.com",
		  "ATTRIBUTE_5": 9515441707,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Business Development",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Partner",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "More than a year",
		  "ATTRIBUTE_15": "AS_IL_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 02:45:56",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 02:45:56",
		  "ATTRIBUTE_20": "Single-Split",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 8,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:05:26"
		},
		{
		  "INTERFACE_ID": 20210411100067,
		  "LEAD_NAME": "[MQL]IL_AS_LG.com_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Sooraj Colour Industries",
		  "CONTACT_POINT": "Sanjith Shenoy/sanjith.shenoy@gmail.com/919447181086",
		  "CORPORATION": "LGEIL",
		  "OWNER": "",
		  "ADDRESS": "/India",
		  "DESCRIPTION": "Interested in \"Multi V S\" Air conditioning system for my 3BHK flat (condo)",
		  "ATTRIBUTE_1": 544270,
		  "ATTRIBUTE_2": "N/A",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "sanjith.shenoy@gmail.com",
		  "ATTRIBUTE_5": 919447181086,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Administrative",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Partner",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "AS_IL_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 11:29:24",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 11:29:24",
		  "ATTRIBUTE_20": "VRF",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:05:21"
		},
		{
		  "INTERFACE_ID": 20210411100068,
		  "LEAD_NAME": "[MQL]SA_AS_LG.com_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Pokkel se smokkel",
		  "CONTACT_POINT": "Fiona Steyn/Pokkelsmokkel@gmail.com/0621791327",
		  "CORPORATION": "LGESA",
		  "OWNER": "",
		  "ADDRESS": "/South Africa",
		  "DESCRIPTION": "Good day i want to sell your products what are min order quantity.  Can we order less if we collect?",
		  "ATTRIBUTE_1": 544272,
		  "ATTRIBUTE_2": "Less than $100,000",
		  "ATTRIBUTE_3": 913,
		  "ATTRIBUTE_4": "Pokkelsmokkel@gmail.com",
		  "ATTRIBUTE_5": 621791327,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Middle East & Africa",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Other",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_SA_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 12:40:00",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 12:40:00",
		  "ATTRIBUTE_20": "VRF",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 9,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:05:28"
		},
		{
		  "INTERFACE_ID": 20210411100069,
		  "LEAD_NAME": "[MQL]MS_AS_LG.com_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Healthcare corporation",
		  "CONTACT_POINT": "Chrissa Cauich/chrissa.c@hcnahealthcare.com/529991903203",
		  "CORPORATION": "LGEMS",
		  "OWNER": "",
		  "ADDRESS": "/Mexico",
		  "DESCRIPTION": "We're looking for air conditioning options for a hospital. We need tot provide Both OR an Common Areas, with an antibacterial environment.",
		  "ATTRIBUTE_1": 544286,
		  "ATTRIBUTE_2": "$100,000 ~ $500,000",
		  "ATTRIBUTE_3": 1010,
		  "ATTRIBUTE_4": "chrissa.c@hcnahealthcare.com",
		  "ATTRIBUTE_5": 529991903203,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Latin America and the Caribbean",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Administrative",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Manager",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "3 Months ~ 6 Months",
		  "ATTRIBUTE_15": "AS_Global_L&C_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 16:29:15",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 16:29:15",
		  "ATTRIBUTE_20": "Multi-Split",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 10,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:08:50"
		},
		{
		  "INTERFACE_ID": 20210411100070,
		  "LEAD_NAME": "[MQL]SB_AS_LG.com_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Aramex",
		  "CONTACT_POINT": "Abdulrahman Alshobaki/abdulrahman1413@gmail.com/966583377855",
		  "CORPORATION": "LGESB",
		  "OWNER": "",
		  "ADDRESS": "/Saudi Arabia",
		  "DESCRIPTION": "السلام عليكم ورحمة الله وبركاته\nاملك شقة سكنية ارغب في ترميمها قريبا وارغب في حلول للتكيف حيث اني احتاج 7 وحدات تكيف وقراءت عن نظام في ار اف \nحيث اني اسكن في الطابق رقم 15 ولا املك مساحة كافية لوضع سبع وحدات خارجية \nارغب في الاستفسار عن التكلفة الكاملة من حيث انشاء الخطوط النحاسية والتركيب والتصميم وتكاليف الصيانة المستقبلية\nوالفرق في الاستهلاك بين الوحدات التقليدية ذات الوحدتين الداخلية والخارجية لك تكييف والوحدة الخارجية التي تستطيع تشغيل اكثر من وحدة داخلية ",
		  "ATTRIBUTE_1": 544295,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "abdulrahman1413@gmail.com",
		  "ATTRIBUTE_5": 966583377855,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Middle East & Africa",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Information Technology",
		  "ATTRIBUTE_10": "AS",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Associate/Analyst",
		  "ATTRIBUTE_13": "Sales Inquiry",
		  "ATTRIBUTE_14": "",
		  "ATTRIBUTE_15": "AS_SB_LG.com_I2B_Ara",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 22:19:59",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 22:19:59",
		  "ATTRIBUTE_20": "VRF",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:05:28"
		},
		{
		  "INTERFACE_ID": 20210411400062,
		  "LEAD_NAME": "[MQL]SP_ID_LG.com_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Casa Civil",
		  "CONTACT_POINT": "Matheus Staff/matheusstaff@casacivil.mt.gov.br/",
		  "CORPORATION": "LGESP",
		  "OWNER": "",
		  "ADDRESS": "/Brazil",
		  "DESCRIPTION": "Preciso de um orçamento de telas de videowall.",
		  "ATTRIBUTE_1": 544255,
		  "ATTRIBUTE_2": "N/A",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "matheusstaff@casacivil.mt.gov.br",
		  "ATTRIBUTE_5": null,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Latin America and the Caribbean",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Information Technology",
		  "ATTRIBUTE_10": "ID",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Associate/Analyst",
		  "ATTRIBUTE_13": "Quotation or purchase consultation",
		  "ATTRIBUTE_14": "N/A",
		  "ATTRIBUTE_15": "ID_SP_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 00:39:59",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 00:39:59",
		  "ATTRIBUTE_20": "Video Wall Signage",
		  "ATTRIBUTE_21": "High Brightness Video Wall",
		  "ATTRIBUTE_22": "55VX1D",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:06:40"
		},
		{
		  "INTERFACE_ID": 20210411400063,
		  "LEAD_NAME": "[MQL]SP_ID_LG.com_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Plansaude assistência médica",
		  "CONTACT_POINT": "sidney junior/sidaodutra@gmail.com/+5519996043044",
		  "CORPORATION": "LGESP",
		  "OWNER": "",
		  "ADDRESS": "/Brazil",
		  "DESCRIPTION": "Gostaria de orçamento para 4 unidades",
		  "ATTRIBUTE_1": 544269,
		  "ATTRIBUTE_2": "",
		  "ATTRIBUTE_3": 1011,
		  "ATTRIBUTE_4": "sidaodutra@gmail.com",
		  "ATTRIBUTE_5": 5519996043044,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Latin America and the Caribbean",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Healthcare Services",
		  "ATTRIBUTE_10": "ID",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Director",
		  "ATTRIBUTE_13": "Quotation or purchase consultation",
		  "ATTRIBUTE_14": "N/A",
		  "ATTRIBUTE_15": "ID_SP_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 10:48:48",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 10:48:48",
		  "ATTRIBUTE_20": "Hospital TV",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 10,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:06:40"
		},
		{
		  "INTERFACE_ID": 20210411400064,
		  "LEAD_NAME": "[MQL]AG_ID_C-display_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "C-display",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Hotel Persal",
		  "CONTACT_POINT": "Fankhauser Clemens/info@persal.at/436643336780",
		  "CORPORATION": "LGEAG",
		  "OWNER": "",
		  "ADDRESS": "/Austria",
		  "DESCRIPTION": "We would like to buy 15-20 new TVs for our guest rooms. The TVs should be very slim like your G model or some of your NanoCell models. Can you please make us an offer.\nThank you and kind regards,\nClemens",
		  "ATTRIBUTE_1": 544277,
		  "ATTRIBUTE_2": "Less than $100,000",
		  "ATTRIBUTE_3": 503,
		  "ATTRIBUTE_4": "info@persal.at",
		  "ATTRIBUTE_5": 436643336780,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Europe",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Business Development",
		  "ATTRIBUTE_10": "ID",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Partner",
		  "ATTRIBUTE_13": "Quotation or purchase consultation",
		  "ATTRIBUTE_14": "More than a year",
		  "ATTRIBUTE_15": "ID_HQ_Cdisplay_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 14:46:20",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 14:46:20",
		  "ATTRIBUTE_20": "Hotel TV",
		  "ATTRIBUTE_21": "WS960H Series",
		  "ATTRIBUTE_22": "55WS960H (EU)",
		  "ATTRIBUTE_23": 5,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:06:40"
		},
		{
		  "INTERFACE_ID": 20210411500060,
		  "LEAD_NAME": "[MQL]BN_IT_LG.com_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Dynamic Security b.v.",
		  "CONTACT_POINT": "A Soultani/Dynasec.be@gmail.com/",
		  "CORPORATION": "LGEBN",
		  "OWNER": "",
		  "ADDRESS": "/Belgium",
		  "DESCRIPTION": "1x bu60pst (cee7/7 plug)",
		  "ATTRIBUTE_1": 544274,
		  "ATTRIBUTE_2": "N/A",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "Dynasec.be@gmail.com",
		  "ATTRIBUTE_5": null,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Europe",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Information Technology",
		  "ATTRIBUTE_10": "IT",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "CEO/Founder",
		  "ATTRIBUTE_13": "Quotation or Purchase Consultation",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "IT_Global_LG.com_I2B_Monitor&Other",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 14:06:46",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 14:06:46",
		  "ATTRIBUTE_20": "Monitor",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": null,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:05:26"
		},
		{
		  "INTERFACE_ID": 20210411700061,
		  "LEAD_NAME": "[MQL]HQ_Solution_LG.com_20210411",
		  "SITE_NAME": "N/A",
		  "LEAD_SOURCE_NAME": "LG.com",
		  "LEAD_SOURCE_TYPE": 11,
		  "ENTRY_TYPE": "L",
		  "ACCOUNT": "Daitoyakuhin Inc.",
		  "CONTACT_POINT": "Ryuichi Ito/ito@daitoyakuhin.co.jp/0222882677",
		  "CORPORATION": "LGEHQ",
		  "OWNER": "",
		  "ADDRESS": "/Japan",
		  "DESCRIPTION": "Thank you for your help.\nMy name is Ito from Daito Yakuhin Co., Ltd., which plans and sells water purifiers and supplements in Japan.\n\nWe would like to sell the water purifier that your company sells in Korea, so we have contacted you.\n\nWe are a company specializing in water purifiers that has a track record of frequently acquiring first place in the water purifier category at Rakuten Ichiba and Yahoo! Shopping in Japan.\n\nWe would appreciate it if you could give us an opportunity to consult with us, including various possibilities such as OEM and import sales.\n\nThank you for your cooperation.",
		  "ATTRIBUTE_1": 544258,
		  "ATTRIBUTE_2": "$100,000 ~ $500,000",
		  "ATTRIBUTE_3": null,
		  "ATTRIBUTE_4": "ito@daitoyakuhin.co.jp",
		  "ATTRIBUTE_5": 222882677,
		  "ATTRIBUTE_6": "",
		  "ATTRIBUTE_7": "Asia",
		  "ATTRIBUTE_8": "",
		  "ATTRIBUTE_9": "Marketing",
		  "ATTRIBUTE_10": "Solution",
		  "ATTRIBUTE_11": "",
		  "ATTRIBUTE_12": "Manager",
		  "ATTRIBUTE_13": "Request for quotation or purchase",
		  "ATTRIBUTE_14": "Less than 3 Months",
		  "ATTRIBUTE_15": "Solution_Global_LG.com_I2B",
		  "ATTRIBUTE_16": "Y",
		  "ATTRIBUTE_17": "2021-04-10 01:44:12",
		  "ATTRIBUTE_18": "Y",
		  "ATTRIBUTE_19": "2021-04-10 01:44:12",
		  "ATTRIBUTE_20": "Home Beauty,Water Care",
		  "ATTRIBUTE_21": "",
		  "ATTRIBUTE_22": "",
		  "ATTRIBUTE_23": 9,
		  "REGISTER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_DATE": "2021-04-11 03:05:01",
		  "TRANSFER_FLAG": "Y",
		  "LAST_UPDATE_DATE": "2021-04-11 00:05:54"
		}
	   ]})
});

router.post('/leadNumberAPI', async function (req, res, next) {
	
	let LeadNumberData_list = await getLeadnumberData();

	// 생성된 데이터를 customobject 에 적재함
	let convert_data_list = ConvertCustomObjectData(data_list);
	console.log(convert_data_list[0].fieldValues);

	let return_data = [];
	
	for(let i = 0 ; i < convert_data_list.length ; i++){
		await b2bgerp_eloqua.data.customObjects.data.create(CustomObject_lead_id, convert_data_list[i]).then((result) => {
			console.log(result);
			return_data.push({
				cod_id : CustomObject_lead_id,
				contactId : convert_data_list[i].contactId,
				emailAddress : convert_data_list[i].emailAddress,
				message : "Success"	
			})
		}).catch((err) => {
			console.error(err);
			console.error(err.message);
			return_data.push({
				cod_id : CustomObject_lead_id,
				contactId : convert_data_list[i].contactId,
				emailAddress : convert_data_list[i].emailAddress,
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
		method: "POST",
		headers:headers,
		body : {} ,
		json : true
	};

	await request(options, async function (error, response, body) {

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

			return body.ContentList;
			// console.log(body.resultData);
		}
	});
}


async function getEloquaContactEmail(data_list){
	if(data_list.length > 1){
		for(let i = 0 ; i < data_list.length ; i ++ ){

			await b2bgerp_eloqua.data.contacts.getOne(data_list[i].Eloqua_id).then((result) => { 
				// console.log(result.data);
				// console.log(result.data.total);

				// Eloqua Create 할때는 상관없지만 
				console.log(result.data);
				if(result.data ){
					data_list[i].emailAddress = result.data.emailAddress;
					// console.log(contacts_data);
				}else{
					data_list[i].emailAddress = 'Email Not Found'
				}
			}).catch((err) => {
				console.error(err.message);
			});	
		}
	}

	return data_list;
}


//커스텀 오브젝트 데이터 형태로 변경 함수
function ConvertCustomObjectData( data_list) {

	let convert_list = [];

	
	for(let i = 0 ; i < data_list.length ; i ++ ){
		let this_data = {};

		this_data.fieldValues = [];
		this_data.contactId = data_list[i].Eloqua_id;
		this_data.isMapped = "Yes";
		this_data.type = "CustomObjectData";
		this_data.emailAddress = data_list[i].emailAddress;

		this_data.fieldValues.push({
			"id": "361",
			"value": data_list[i].emailAddress
		}); // EmailAddress
		this_data.fieldValues.push({
			"id": "360",
			"value": data_list[i].Eloqua_id
		}); // Eloqua Contact ID			
		this_data.fieldValues.push({
			"id": "362",
			"value": data_list[i].LeadNumber
		}); // Leadnumber
		this_data.fieldValues.push({
			"id": "363",
			"value": utils.timeConverter( "GET_UNIX" , data_list[i].LeadCreateDate)
		}); //Leadnumber 생성일
		this_data.fieldValues.push({
			"id": "394",
			"value": data_list[i].Interface_id
		}); // Interface ID

		convert_list.push(this_data);
	}
	return convert_list;
}

module.exports = router;
module.exports.bant_send = bant_send;