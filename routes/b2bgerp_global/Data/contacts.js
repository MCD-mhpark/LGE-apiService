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
    case "Kurumsal":
    case "корпоративний":
    case "企业":
    case "d'entreprise":
    case "Társasági":
    case "Zbiorowy":
    case "korporační":
    case "Corporativo":
    case "corporativo":
    case "الشركات":
    case "perusahaan":
    case "đoàn thể":
    case "ขององค์กร":
      result = "01";
      break;
    case "Education":
    case "Eğitim":
    case "освіту":
    case "教育":
    case "Éducation":
    case "Oktatás":
    case "Edukacja":
    case "Vzdělání":
    case "Educación":
    case "Educação":
    case "التعليم":
    case "pendidikan":
    case "Giáo dục":
    case "การศึกษา":
      result = "02";
      break;
    case "Factory":
    case "Fabrika":
    case "завод":
    case "厂":
    case "Usine	Gyár":
    case "Gyár":
    case "Fabryka":
    case "Továrna":
    case "Fábrica":
    case "Fábrica":
    case "مصنع":
    case "Pabrik":
    case "Nhà máy":
    case "โรงงาน":
      result = "03";
      break;
    case "Government Department":
    case "Hükümet":
    case "departmanı":
    case "Департамент уряду":
    case "政府部门":
    case "Ministère":
    case "Kormányhivatal":
    case "Departament rządu":
    case "Ministerstvo":
    case "Departamento de Gobierno":
    case "Departamento do governo":
    case "دائرة حكومية":
    case "Departemen pemerintahan":
    case "Cơ quan chính phủ":
    case "กรม":
      result = "04";
      break;
    case "Hospitality":
    case "misafirperverlik":
    case "привітність":
    case "招待费":
    case "Hospitalité":
    case "Vendégszeretet":
    case "Gościnność":
    case "Pohostinství":
    case "Hospitalidad":
    case "حسن الضيافة":
    case "Keramahan":
    case "Lòng hiếu khách":
    case "การต้อนรับขับสู้":
      result = "05";
      break;
    case "Public Facility": //Eloqua value값 추가 필요
    case "Kamu tesisi":
    case "громадський фонд":
    case "公共设施":
    case "Installation publique":
    case "Nyilvános Facility":
    case "Obiekt publiczny":
    case "Public Facility":
    case "Facilidad publica":
    case "Facilidade pública":
    case "حيث كان أقل وظيفة المفضلة لديك":
    case "Fasilitas Umum":
    case "Cơ sở công cộng":
    case "สิ่งอำนวยความสะดวกของประชาชน":
      result = "08";
      break;
    case "Retail":
    case "Perakende":
    case "Роздрібна торгівля":
    case "零售":
    case "Vente au détail":
    case "Kiskereskedelem":
    case "Sprzedaż":
    case "Maloobchodní":
    case "Al por menor":
    case "Varejo":
    case "بيع بالتجزئة":
    case "Eceran":
    case "Bán lẻ":
    case "ขายปลีก":
      result = "09";
      break;
    case "Special purpose": //Eloqua value값 추가 필요
    case "Özel amaç":
    case "спеціальне призначення":
    case "特殊目的":
    case "But spécial":
    case "Különleges célú":
    case "Specjalny cel":
    case "Speciální účel":
    case "Proposito especial":
    case "Propósito especial":
    case "لأغراض خاصة":
    case "Tujuan khusus":
    case "Mục đích đặc biệt":
    case "วัตถุประสงค์พิเศษ":
      result = "10";
      break;
    case "Transportation":
    case "taşımacılık":
    case "транспорт":
    case "运输":
    case "Transport":
    case "Szállítás":
    case "Transport":
    case "Přeprava":
    case "Transporte":
    case "Transporte":
    case "وسائل النقل":
    case "Angkutan":
    case "Vận chuyển":
    case "การขนส่ง":
      result = "11";
      break;
    case "Residential":  //Eloqua valuer값 추가 필요
    case "yerleşim":
    case "житлової":
    case "住宅":
    case "Résidentiel":
    case "Lakó":
    case "Osiedle mieszkaniowe":
    case "Obytný":
    case "residencial":
    case "سكني":
    case "Khu dân cư":
    case "ที่อยู่อาศัย":
    case "Khu dân cư":
    case "ที่อยู่อาศัย":
      result = "15";
      break;
    //case "Power plant / Renewable energy":  //Eloqua valuer값 추가 필요
    case "Power plant":  //Eloqua valuer값 추가 필요
    case "Enerji santrali":
    case "Електростанція":
    case "发电厂":
    case "Centrale électrique":
    case "Erőmű":
    case "Elektrownia":
    case "Elektrárna":
    case "Planta de energía":
    case "Usina elétrica":
    case "محطة توليد الكهرباء":
    case "Pembangkit listrik":
    case "Nhà máy điện":
    case "โรงไฟฟ้า":
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
        case "Ресторан / F & B / ДКС":
        case "餐厅/ F＆B / QSR":
        case "Restaurant / F & B / QSR":
        case "Étterem / F & B / QSR":
        case "Restauracja / F & B / QSR":
        case "Restaurant / F & B / QSR":
        case "Restaurante / F & B / QSR":
        case "Restaurante / F & B / QSR":
        case "مطعم / F & B / QSR":
        case "Nhà hàng / F & B / QSR":
        case "ร้านอาหาร / F & B / ธุรกิจอาหารบริการด่วน":
          result = "0910"; break;

        case "Specialty store":
        case "Özel mağaza":
        case "спеціальність магазин":
        case "专业店":
        case "Boutique sécialisée":
        case "Sklep specjalistyczny":
        case "specializované prodejně":
        case "Tienda de especialidades":
        case "loja da especialidade":
        case "مخزن التخصص":
        case "toko khusus":
        case "cửa hàng đặc sản":
        case "ร้านค้าพิเศษ":
          result = "0914"; break;

        case "Hyper market & grocery":
        case "Hiper market ve bakkal":
        case "Hyper ринок і продуктовий":
        case "超市场和杂货店":
        case "Hyper marché et épicerie":
        case "Hyper-piaci és zöldséges":
        case "Hiper market i sklep spożywczy":
        case "Hyper trh a obchod s potravinami":
        case "hipermercado y supermercado":
        case "mercado hiper e supermercado":
        case "سوق فرط والبقالة":
        case "pasar hiper & kelontong":
        case "thị trường Hyper & tạp hóa":
        case "ตลาดไฮเปอร์และร้านขายของชำ":
          result = "0907"; break;

        case "Shopping mall":
        case "Alışveriş Merkezi":
        case "Торговий центр":
        case "购物中心":
        case "Centre commercial":
        case "Bevásárló központ":
        case "Centrum handlowe":
        case "Obchodní dům":
        case "Centro comercial":
        case "Centro de compras":
        case "مركز تسوق":
        case "Pusat perbelanjaan":
        case "Trung tâm mua sắm":
        case "ห้างสรรพสินค้า":
          result = "0911"; break;

        case "Other Stores":
        case "Diğer Mağazaları":
        case "інші магазини":
        case "其他商店":
        case "D'autres magasins":
        case "egyéb üzletek":
        case "Inne sklepy":
        case "Ostatní Stores":
        case "otras tiendas":
        case "outros Stores":
        case "متاجر أخرى":
        case "Toko lain":
        case "Gian hàng khác":
        case "ร้านค้าอื่น ๆ":
          result = "0913"; break;
      }
      break;

    case "05":
      switch (_Business_Sector_Vertival2_Name) {
        case "Hotel / Resort / Casino":
        case "Otel / Resort / Casino":
        case "Готель / Курорт / Казино":
        case "酒店/度假村/赌场":
        case "Hôtel / Resort / Casino":
        case "Hotel / Resort / kaszinó":
        case "Hotel / resort / Casino":
        case "Hotel / Resort / Casino":
        case "Hotel / Resort / Casino":
        case "Hotel / Resort / Casino":
        case "فندق / منتجع / كازينو":
        case "Hotel / Resort / Casino":
        case "Khách sạn / Resort / Casino":
        case "โรงแรม / รีสอร์ท / คาสิโน":
          result = "0503"; break;

        case "Cruise":
        case "Seyir":
        case "круїз":
        case "巡航":
        case "Croisière":
        case "Hajókázás":
        case "Rejs":
        case "Plavba":
        case "Crucero":
        case "Cruzeiro":
        case "رحلة بحرية":
        case "Pelayaran":
        case "Du thuyền":
        case "ล่องเรือ":
          result = "0501"; break;

        case "Hospital":
        case "Hastane":
        case "лікарня":
        case "医院":
        case "Hôpital":
        case "Kórház":
        case "Szpital":
        case "Nemocnice":
        case "Hospital":
        case "Hospital":
        case "مستشفى":
        case "Rumah Sakit":
        case "bệnh viện":
        case "โรงพยาบาล":
          result = "0502"; break;

        case "LTC (Long-Term Care)":
        case "LTC (Uzun Süreli Bakım)":
        case "LTC (Long-Term Care)":
        case "LTC（长期护理）":
        case "LTC (Soins de longue durée)":
        case "LTC (Long-Term Care)":
        case "LTC (Long-Term Care)":
        case "LTC (Long-Term Care)":
        case "LTC (Long-Term Care)":
        case "LTC (Long-Term Care)":
        case "LTC (طويل الأجل العناية)":
        case "LTC (Long-Term Care)":
        case "LTC (Long-Term Care)":
        case "LTC (การดูแลระยะยาว)":
          result = "0504"; break;

        case "Dormitory":
        case "Yurt":
        case "гуртожиток":
        case "宿舍":
        case "Dortoir":
        case "Hálóterem":
        case "Akademik":
        case "Ubytovna":
        case "Dormitorio":
        case "Dormitório":
        case "مسكن":
        case "asrama mahasiswa":
        case "ký túc xá":
        case "หอพัก":
          result = "0508"; break;

        case "Fitness":
        case "Fitness":
        case "фітнес":
        case "身体素质":
        case "Aptitude":
        case "alkalmasság":
        case "Zdatność":
        case "Zdatnost":
        case "Aptitud":
        case "Ginástica":
        case "اللياقه البدنيه":
        case "Kebugaran":
        case "Sự khỏe khoắn":
        case "การออกกำลังกาย":
          result = "0509"; break;

        case "Others":
        case "Diğerleri":
        case "інші":
        case "其他":
        case "Autres":
        case "Egyéb":
        case "Pozostałe":
        case "jiní":
        case "Otros":
        case "Outras":
        case "الآخرين":
        case "Lainnya":
        case "Khác":
        case "คนอื่น ๆ":
          result = "0507"; break;
      }
      break;

    case "15":
      switch (_Business_Sector_Vertival2_Name) {
        case "Apartment": 
        case "Apartman" :
        case "квартира" :
        case "公寓" :
        case "Appartement" :
        case "Lakás" :
        case "Apartament" :
        case "Byt" :
        case "Departamento" :
        case "Apartamento" :
        case "شقة" :
        case "Apartemen" :
        case "Căn hộ, chung cư" :
        case "อพาร์ทเม้น" :
        result = "1501"; break;

        case "Officetel": 
        case "Officetel" :
        case "Officetel" :
        case "Officetel" :
        case "officetel" :
        case "Officetel" :
        case "Officetel" :
        case "Officetel" :
        case "officetel" :
        case "officetel" :
        case "Officetel" :
        case "officetel" :
        case "Officetel" :
        case "Officetel" :
        result = "1502"; break;

        case "Townhouse":
        case "Townhouse":
        case "міська в'язниця":
        case "联排别墅":
        case "maison de ville":
        case "Townhouse":
        case "Kamienica":
        case "městský dům":
        case "Townhouse":
        case "condomínio":
        case "تاون هاوس":
        case "Townhouse":
        case "Townhouse":
        case "ทาวน์เฮ้าส์":
        result = "1503"; break;

        case "Villa / Single-Family Home":
        case "Villa / Müstakil Ev" :
        case "Вілла / будинок для однієї сім'ї" :
        case "别墅/单户住宅" :
        case "Villa / Maison unifamiliale" :
        case "Villa / Egy családi ház" :
        case "Villa / domu jednorodzinnego" :
        case "Villa / Single-Family Home" :
        case "Villa / vivienda unifamiliar" :
        case "Villa / Single-família" :
        case "فيلا / أعزب للعائلات الرئيسية" :
        case "Villa / Single-Family Home" :
        case "Villa / Single-Family Home" :
        case "วิลล่า / บ้านครอบครัวเดี่ยว" :
        result = "1504"; break;

        case "Others":
        case "Diğerleri" :
        case "інші" :
        case "其他" :
        case "Autres" :
        case "Egyéb" :
        case "Pozostałe" :
        case "jiní" :
        case "Otros" :
        case "Outras" :
        case "الآخرين" :
        case "Lainnya" :
        case "Khác" :
        case "คนอื่น ๆ" :
        result = "1505"; break;
      }
      break;

    case "01":
      switch (_Business_Sector_Vertival2_Name) {
        case "Office": 
        case "Ofis" :
        case "офіс" :
        case "办公室" :
        case "Bureau" :
        case "Hivatal" :
        case "Gabinet" :
        case "Kancelář" :
        case "Oficina" :
        case "Escritório" :
        case "مكتب. مقر. مركز" :
        case "Kantor" :
        case "văn phòng" :
        case "สำนักงาน" :
          result = "0113"; break;

        case "Conference/Meeting Room/Collaboration spaces":
        case "Konferans / Toplantı Odası / İşbirliği alanlarda":
        case "Конференція / Meeting Room / Collaboration простору":
        case "会议/会议室/协作空间":
        case "Conférence / Salle de réunion / espaces de collaboration":
        case "Konferencia / Tárgyaló / Collaboration terek":
        case "Conference / Meeting Room / przestrzenie Collaboration":
        case "Konferenční / zasedací místnost / Spolupráce prostory":
        case "Sala de reuniones / salas de conferencias / Colaboración":
        case "/ Sala de Reunião espaços de conferências / Colaboração":
        case "مؤتمر / غرفة الاجتماعات / المساحات التعاون":
        case "Konferensi / Ruang Rapat / ruang Kolaborasi":
        case "Hội nghị / Phòng Họp / không gian hợp tác":
        case "การประชุม / ห้องประชุม / ช่องว่างการทำงานร่วมกัน":
          result = "0114"; break;

        case "Auditorium":
        case "Konferans salonu":
        case "зал для глядачів":
        case "礼堂":
        case "Salle":
        case "Előadóterem":
        case "Audytorium":
        case "Hlediště":
        case "Sala":
        case "Auditório":
        case "قاعة محاضرات":
        case "Auditorium":
        case "Thính phòng":
        case "หอประชุม":
          result = "0115"; break;

        case "Control/Command room":
        case "Kontrol / Komut oda":
        case "Контроль / Command номер":
        case "控制/指挥室":
        case "Salle de contrôle / commande":
        case "Ellenőrző / Command szoba":
        case "Control Room / poleceń":
        case "Ovládání / Command pokoj":
        case "sala de control / comando":
        case "sala de controlo / comando":
        case "غرفة التحكم / القيادة":
        case "Control / Command ruang":
        case "phòng điều khiển / Command":
        case "ห้องควบคุม / คำสั่ง":
          result = "0116"; break;

        case "Broadcasting/Studio":
        case "Yayın / Stüdyo":
        case "Мовлення / Studio":
        case "广播/录音室":
        case "Radiodiffusion / studio":
        case "Broadcasting / Studio":
        case "Nadawanie / Studio":
        case "Vysílání / Studio":
        case "Difusión / Estudio":
        case "Broadcasting / Studio":
        case "البث / ستوديو":
        case "Broadcasting / Studio":
        case "Broadcasting / Studio":
        case "บรอดคาสติ้ง / สตูดิโอ":
          result = "0106"; break;

        case "Traning/Experience center":
        case "Traning / Deneyim merkezi":
        case "Traning / Досвід центр":
        case "教育训练/体验中心":
        case "Traning / Centre d'expérience":
        case "Gépekkel / Experience Center":
        case "Szkolenia / Centrum Doświadczenie":
        case "Tréninkový / Zkušenosti centrum":
        case "Traning / centro Experience":
        case "Traning centro / Experiência":
        case "تمارين / مركز الخبرة":
        case "Traning / Pengalaman pusat":
        case "Đào tạo / Trung tâm Kinh nghiệm":
        case "Traning / ศูนย์ประสบการณ์":
          result = "0117"; break;

        case "Show room/Briefing center":
        case "Göster odası / Brifing merkezi":
        case "Показати номер / Брифінг-центр":
        case "展示厅/简报中心":
        case "Show room / Centre d'information":
        case "Megjelenítése szoba / Tájékoztató központ":
        case "Show room / Centrum Briefing":
        case "Show room / Briefing centrum":
        case "Show room / Centro de orientación":
        case "Show room centro / Briefing":
        case "صالة عرض / مركز إحاطة":
        case "Show room / Briefing pusat":
        case "Hiện phòng / trung tâm tại cuộc họp báo":
        case "แสดงห้อง / ศูนย์การบรรยายสรุป":
          result = "0118"; break;

        case "Common spaces ":
        case "Ortak alanlarda":
        case "загальні простору":
        case "公共空间":
        case "Les espaces communs":
        case "közös terek":
        case "wspólne przestrzenie":
        case "společné prostory":
        case "espacios comunes":
        case "espaços comuns":
        case "المساحات المشتركة":
        case "ruang umum":
        case "không gian chung":
        case "พื้นที่ที่พบบ่อย":
          result = "0119"; break;

        case "Client interaction venue/space":
        case "Müşteri etkileşim mekan / boşluk" :
        case "Місце клієнта взаємодії / простір" :
        case "客户端交互地点/空间" :
        case "lieu / espace d'interaction client" :
        case "Ügyfél kölcsönhatás helyszín / tér" :
        case "Klient interakcja miejsce / miejsca" :
        case "Klient interakce místo / prostor" :
        case "lugar interacción cliente / espacio" :
        case "local de interação cliente / espaço" :
        case "مكان التفاعل العميل / الفضاء" :
        case "Klien interaksi tempat / ruang" :
        case "Khách hàng tương tác địa điểm / không gian" :
        case "สถานปฏิสัมพันธ์ Client / พื้นที่" :
           result = "0120"; break;

        case "Others":
        case "Diğerleri":
        case "інші":
        case "其他":
        case "Autres":
        case "Egyéb":
        case "Pozostałe":
        case "jiní":
        case "Otros":
        case "Outras":
        case "الآخرين":
        case "Lainnya":
        case "Khác":
        case "คนอื่น ๆ":
          result = "0121"; break;
      }
      break;

    case "11":
      switch (_Business_Sector_Vertival2_Name) {
        case "Air Transport":
        case "Hava Taşımacılığı":
        case "повітряне перевезення":
        case "航空运输":
        case "Transport aérien":
        case "Légi közlekedés":
        case "Transport lotniczy":
        case "Letecká doprava":
        case "Transporte aéreo":
        case "Transporte aéreo":
        case "النقل الجوي":
        case "Transportasi udara":
        case "Vận tải Hàng không":
        case "การขนส่งทางอากาศ":
          result = "1101"; break;

        case "Road":
        case "Yol":
        case "дорога":
        case "路":
        case "Route":
        case "Út":
        case "Droga":
        case "Silnice":
        case "La carretera":
        case "Estrada":
        case "الطريق":
        case "Jalan":
        case "Đường":
        case "ถนน":
          result = "1104"; break;

        case "Railway & Metro":
        case "Demiryolu & Metro":
        case "Залізничний і метро":
        case "铁路，地铁":
        case "Chemin de fer et métro":
        case "Vasúti, Metro":
        case "Kolejowy Metro":
        case "Železniční Metro":
        case "Ferroviario, metro":
        case "Ferroviário, Metro":
        case "السكك الحديدية و المترو":
        case "Railway & Metro":
        case "Railway & Metro":
        case "รถไฟและรถไฟใต้ดิน":
          result = "1103"; break;

        case "Sea":
        case "Deniz":
        case "море":
        case "海":
        case "Mer":
        case "Tenger":
        case "Morze":
        case "Moře":
        case "Mar":
        case "Mar":
        case "بحر":
        case "Laut":
        case "Biển":
        case "ทะเล":
          result = "1102"; break;

        case "Others":
        case "Diğerleri":
        case "інші":
        case "其他":
        case "Autres":
        case "Egyéb":
        case "Pozostałe":
        case "jiní":
        case "Otros":
        case "Outras":
        case "الآخرين":
        case "Lainnya":
        case "Khác":
        case "คนอื่น ๆ":
          result = "1105"; break;
      }
      break;

    case "02":
      switch (_Business_Sector_Vertival2_Name) {
        case "K12 (Kindergarten & Schools)":
        case "K12 (Yuva ve Okullar)":
        case "К12 (дитячий садок і школа)":
        case "K12（幼儿园及学校）":
        case "K12 (jardin d'enfants et écoles)":
        case "K12 (Óvoda és iskolák)":
        case "K12 (przedszkola i szkoły)":
        case "K12 (mateřské školky a školy)":
        case "K12 (jardín de infancia y escuelas)":
        case "K12 (do jardim de infância e escolas)":
        case "K12 (رياض اطفال ومدارس)":
        case "K12 (TK & Sekolah)":
        case "K12 (Mẫu giáo & Trường)":
        case "K12 (โรงเรียนอนุบาลและโรงเรียน)":
          result = "0201"; break;

        case "HigherEd (College & University)":
        case "HigherEd (Üniversite ve Üniversite)":
        case "HigherEd (коледж і університет)":
        case "HigherEd（学院和大学）":
        case "HigherEd (College & University)":
        case "HigherEd (College & University)":
        case "HigherEd (College & University)":
        case "HigherEd (College a University)":
        case "Highered (Colegio y Universidad)":
        case "HigherEd (Colégio e Universidade)":
        case "HigherEd (كلية وجامعة)":
        case "Highered (College & University)":
        case "HigherEd (Cao đẳng & Đại học)":
        case "HigherEd (วิทยาลัยและมหาวิทยาลัย)":
          result = "0202"; break;

        case "Institute & Academy":
        case "Enstitü & Akademi":
        case "Інститут і Академія":
        case "学院院士":
        case "Institut et Académie":
        case "Institute & Academy":
        case "Instytut & Academy":
        case "Institute & Academy":
        case "Instituto y Academia":
        case "Institute & Academy":
        case "معهد وأكاديمية":
        case "Institute & Academy":
        case "Viện & Academy":
        case "สถาบันและสถาบันการศึกษา":
          result = "0205"; break;

        case "Others":
        case "Diğerleri":
        case "інші":
        case "其他":
        case "Autres":
        case "Egyéb":
        case "Pozostałe":
        case "jiní":
        case "Otros":
        case "Outras":
        case "الآخرين":
        case "Lainnya":
        case "Khác":
        case "คนอื่น ๆ":
          result = "0204"; break;
      }
      break;

    case "08":
      switch (_Business_Sector_Vertival2_Name) {
        case "Culture":
        case "Kültür":
        case "культура":
        case "文化":
        case "Culture":
        case "Kultúra":
        case "Kultura":
        case "Kultura":
        case "Cultura":
        case "Cultura":
        case "حضاره":
        case "Budaya":
        case "Văn hóa":
        case "วัฒนธรรม":
          result = "0816"; break;

        case "Sports":
        case "Spor Dalları":
        case "спортивний":
        case "体育":
        case "Des sports":
        case "Sport":
        case "Sporty":
        case "Sportovní":
        case "Deportes":
        case "Esportes":
        case "رياضات":
        case "Olahraga":
        case "Các môn thể thao":
        case "กีฬา":
          result = "0813"; break;

        case "Religious facility":
        case "Dini tesis":
        case "релігійний об'єкт":
        case "宗教设施":
        case "centre religieux":
        case "vallási lehetőség":
        case "obiekt religijny":
        case "náboženská zařízení":
        case "instalación religiosa":
        case "instalação religiosa":
        case "منشأة الديني":
        case "fasilitas keagamaan":
        case "cơ sở tôn giáo":
        case "สถานที่ทางศาสนา":
          result = "0817"; break;

        case "Outdoor Advertisement":
        case "Açık Tanıtım":
        case "зовнішня реклама":
        case "户外广告":
        case "Publicité extérieure":
        case "Kültéri reklám":
        case "reklama zewnętrzna":
        case "venkovní reklama":
        case "Publicidad exterior":
        case "Anúncio Ao ar livre":
        case "الإعلان في الهواء الطلق":
        case "luar ruangan Iklan":
        case "ngoài trời Quảng cáo":
        case "โฆษณากลางแจ้ง":
          result = "0818"; break;

        case "Others":
        case "Diğerleri":
        case "інші":
        case "其他":
        case "Autres":
        case "Egyéb":
        case "Pozostałe":
        case "jiní":
        case "Otros":
        case "Outras":
        case "الآخرين":
        case "Lainnya":
        case "Khác":
        case "คนอื่น ๆ":
          result = "0815"; break;
      }
      break;

    case "04":
      switch (_Business_Sector_Vertival2_Name) {
        case "General Government Office":
        case "Genel Hükümet Ofisi":
        case "Управління Спільного уряду":
        case "一般政府办公室":
        case "Bureau du général":
        case "Általános Kormányhivatal":
        case "Główny Urząd rząd":
        case "Vládní úřad":
        case "Oficina General de Gobierno":
        case "Escritório Geral de Governo":
        case "مكتب الحكومة العامة":
        case "Kantor Pemerintah Umum":
        case "Văn phòng Chính phủ nói chung":
        case "สำนักงานทั่วไปรัฐบาล":
          result = "0403"; break;

        case "Military":
        case "Askeri":
        case "військовий":
        case "军事":
        case "Militaire":
        case "Katonai":
        case "Wojskowy":
        case "Válečný":
        case "Militar":
        case "Militares":
        case "الجيش":
        case "Militer":
        case "Quân đội":
        case "ทหาร":
          result = "0404"; break;

        case "Police/Fire station":
        case "Polis / Yangın istasyonu":
        case "Поліція / станція пожежної":
        case "警察/消防局":
        case "Police / Pompiers":
        case "Rendőrség / Tűzoltó állomás":
        case "Policja / Straż pożarna":
        case "Policie / Hasiči":
        case "Policía / estación de Fuego":
        case "Polícia / Bombeiros":
        case "الشرطة / محطة النار":
        case "Polisi / Stasiun Api":
        case "Cảnh sát / Trạm cứu hỏa":
        case "ตำรวจ / สถานีดับเพลิง":
          result = "0406"; break;

        case "Welfare facilities ":
        case "Refah tesisleri":
        case "об'єкти соціального забезпечення":
        case "福利设施":
        case "Installations de bien-être":
        case "Szociális létesítmények":
        case "Wyposażenie socjalne":
        case "sociální zařízení":
        case "Servicios de bienestar":
        case "Instalações de bem-estar":
        case "مرافق الرعاية":
        case "fasilitas kesejahteraan":
        case "Các cơ sở phúc lợi xã hội":
        case "สิ่งอำนวยความสะดวกสวัสดิการ":
          result = "0402"; break;

        case "Others":
        case "Diğerleri":
        case "інші":
        case "其他":
        case "Autres":
        case "Egyéb":
        case "Pozostałe":
        case "jiní":
        case "Otros":
        case "Outras":
        case "الآخرين":
        case "Lainnya":
        case "Khác":
        case "คนอื่น ๆ":
          result = "0410"; break;
      }
      break;

    case "03":
      switch (_Business_Sector_Vertival2_Name) {
        case "Manufacturing factory":
        case "İmalat fabrikası":
        case "виробництво заводу":
        case "制造工厂":
        case "usine de fabrication":
        case "Gyártás gyár":
        case "fabryka":
        case "výrobní závod":
        case "fábrica de fabricación":
        case "fábrica de produção":
        case "مصنع تصنيع":
        case "pabrik manufaktur":
        case "Nhà máy chế tạo":
        case "โรงงานผลิต":
          result = "0309"; break;

        case "Chemical factory":
        case "Kimya fabrikası":
        case "хімічний завод":
        case "化工厂":
        case "Usine de produits chimiques":
        case "vegyi gyárban":
        case "Fabryka chemiczna":
        case "chemická továrna":
        case "Fábrica de químicos":
        case "fábrica química":
        case "مصنع كيميائي":
        case "pabrik kimia":
        case "Nhà máy hoá chất":
        case "โรงงานเคมี":
          result = "0310"; break;

        case "Pharmaceutical factory":
        case "İlaç fabrikası":
        case "Фармацевтична фабрика":
        case "药厂":
        case "usine pharmaceutique":
        case "Gyógyszeripari gyár":
        case "fabryka farmaceutyczna":
        case "Farmaceutická továrna":
        case "fábrica de productos farmacéuticos":
        case "fábrica de produtos farmacêuticos":
        case "مصنع للأدوية":
        case "pabrik farmasi":
        case "nhà máy dược phẩm":
        case "โรงงานเภสัชกรรม":
          result = "0311"; break;

        case "Others":
        case "Diğerleri":
        case "інші":
        case "其他":
        case "Autres":
        case "Egyéb":
        case "Pozostałe":
        case "jiní":
        case "Otros":
        case "Outras":
        case "الآخرين":
        case "Lainnya":
        case "Khác":
        case "คนอื่น ๆ":
          result = "0301"; break;
      }
      break;

    case "16":
      switch (_Business_Sector_Vertival2_Name) {
        case "Power plant":
        case "Enerji santrali":
        case "Електростанція":
        case "发电厂":
        case "Centrale électrique":
        case "Erőmű":
        case "Elektrownia":
        case "Elektrárna":
        case "Planta de energía":
        case "Usina elétrica":
        case "محطة توليد الكهرباء":
        case "Pembangkit listrik":
        case "Nhà máy điện":
        case "โรงไฟฟ้า":
          result = "1601"; break;

        case "Renewable energy":
        case "Yenilenebilir enerji":
        case "Відновлювальна енергія":
        case "可再生能源":
        case "Énergie renouvelable":
        case "Megújuló energia":
        case "Energia odnawialna":
        case "Obnovitelná energie":
        case "Energía renovable":
        case "Energia renovável":
        case "طاقة متجددة":
        case "Energi terbarukan":
        case "Năng lượng tái tạo":
        case "พลังงานทดแทน":
          result = "1602"; break;

        case "Energy Storage & Saving":
        case "Enerji Depolama ve Tasarruf":
        case "Акумулювання енергії і економії":
        case "储能及节能":
        case "Stockage de l'énergie et économie":
        case "Energy Storage & Saving":
        case "Energy Saving & Storage":
        case "Energy Storage & Saving":
        case "Almacenamiento de energía y ahorro":
        case "Armazenamento de Energia & Economia":
        case "تخزين الطاقة وتوفير":
        case "Energi Storage & Saving":
        case "Năng lượng lưu trữ & tiết kiệm":
        case "การจัดเก็บพลังงานและประหยัด":
          result = "1603"; break;

        case "Others":
        case "Diğerleri":
        case "інші":
        case "其他":
        case "Autres":
        case "Egyéb":
        case "Pozostałe":
        case "jiní":
        case "Otros":
        case "Outras":
        case "الآخرين":
        case "Lainnya":
        case "Khác":
        case "คนอื่น ๆ":
          result = "1604"; break;
      }
      break;

    case "10":
      switch (_Business_Sector_Vertival2_Name) {
        case "Mixed-use (Multi Complex)":
        case "Karma kullanımlı (Multi Complex)":
        case "Багатофункціональний (Multi комплексів)":
        case "混合使用（多复杂）":
        case "À usage mixte (Multi complexe)":
        case "Vegyes-felhasználás (Multi Complex)":
        case "Mixed-use (Multi Complex)":
        case "Víceúčelový (multi Complex)":
        case "Uso mixto (Multi Complejo)":
        case "De uso misto (multi Complex)":
        case "متعدد الاستخدامات (موضوع مجمع)":
        case "Mixed-use (Multi Complex)":
        case "Đa chức năng (Multi Complex)":
        case "ใช้ผสม (หลายคอมเพล็กซ์)":
          result = "1011"; break;

        case "Botanical Garden / Green House":
        case "Botanik Bahçe / Green House":
        case "Ботанічний сад / Green House":
        case "植物园/绿屋":
        case "Jardin botanique / Green House":
        case "Növénykert / Green House":
        case "Ogród Botaniczny / Green House":
        case "Botanická zahrada / Green House":
        case "Jardín Botánico de la casa verde /":
        case "Jardim Botânico Green House /":
        case "الحديقة النباتية / البيت الأخضر":
        case "Botanical Garden / Green House":
        case "Botanical Garden / Green House":
        case "สวนพฤกษศาสตร์ / กรีนเฮ้าส์":
          result = "1009"; break;

        case "Telecom base station / Data, Call center":
        case "Telekom baz istasyonu / Veri, Çağrı merkezi":
        case "базова станція Telecom / Data, Call-центр":
        case "电信基站/数据，呼叫中心":
        case "station de base Télécom / données, centre d'appels":
        case "Telecom bázisállomás / Data, Call center":
        case "Stacja bazowa Telecom / danych, Call center":
        case "Telecom základnové stanice / Data, Call centrum":
        case "estación base de telecomunicaciones / datos, centro de atención telefónica":
        case "estação base Telecom / Dados, centro de chamadas":
        case "المحطة الأساسية للاتصالات / البيانات، مركز الاتصال":
        case "Telekomunikasi base station / Data, Call center":
        case "Telecom trạm gốc / Dữ liệu, Call center":
        case "โทรคมนาคมสถานีฐาน / ข้อมูล, call center":
          result = "1005"; break;

        case "Others":
        case "Diğerleri":
        case "інші":
        case "其他":
        case "Autres":
        case "Egyéb":
        case "Pozostałe":
        case "jiní":
        case "Otros":
        case "Outras":
        case "الآخرين":
        case "Lainnya":
        case "Khác":
        case "คนอื่น ๆ":
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
async function get_b2bgerp_global_bant_data(_business_name) {
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
  yesterday_Object.start = '2021-02-02';
  yesterday_Object.end = '2021-02-02';
  //var yesterday_Object = utils.today_getDateTime();
  var queryText = "C_DateModified>" + "'" + yesterday_Object.start + " 00:00:01'" + "C_DateModified<" + "'" + yesterday_Object.end + " 23:59:59'" + status_bant + "='MQL'";
  //yesterday_getUnixTime
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

router.get('/:businessName', async function (req, res, next) {
  var business_name = req.params.businessName;
  //business_department ( AS , CLS , CM , ID , IT , Solar , Solution, Kr)

  //BANT기준 B2B GERP GLOBAL CONTACTS 조회
  var contacts_data = await get_b2bgerp_global_bant_data(business_name);

  // res.json(contacts_data);
  // return;
  if (contacts_data != null) {
    //Eloqua Contacts
    //business_department ( AS , CLS , CM , ID , IT , Solar , Solution, Kr )
    var request_data = Convert_B2BGERP_GLOBAL_DATA(contacts_data, business_name);

    res.json({ ContentList: request_data });

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

module.exports = router;
