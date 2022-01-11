const express = require('express');
const request = require('request');
const convert = require('xml-js');
const PrivateApt = require('../models/PrivateApt');
const { sequelize } = require('../models/PubNotice');
const router = express.Router();

//목록 받기
router.get('/', async (req, res, next) => {
    let newDate = new Date();
    let year = newDate.getFullYear();
    let month = newDate.getMonth() +1;
    let date = newDate.getDate();
    try {
        const SERVICE_KEY = 'Pifa2dNF%2F%2BDOgnjpswa7G%2B8t%2B1B28ekfKa%2FmZtTwwmLTZtbw05Xn8DeUw0BHRG2mEg4M1BCH1WfcQJdblk3TmQ%3D%3D';
        for (let num = 1; num <= 10; num++) {
            const requestUrl = `https://openapi.reb.or.kr/OpenAPI_ToolInstallPackage/service/rest/ApplyhomeInfoSvc/getLttotPblancList?serviceKey=${SERVICE_KEY}&startmonth=${year}${month}&endmonth=${year}${month}${date}&houseSecd=01&pageNo=${num}`;
            request(requestUrl, async (err, re, body) => {
                if (err) {
                    console.log(err);
                } else {
                    let result = body;
                    let xmlToJson = convert.xml2json(result, { compact: true, spaces: 4 });
                    let info = JSON.parse(xmlToJson).response.body.items.item;
                    for (i in info) {
                        console.log(info[i])
                        await PrivateApt.create({
                            pblancNo: Number(info[i]['pblancNo']['_text']),
                            executor: info[i]['bsnsMbyNm']['_text'],
                            operation: info[i]['houseDtlSecdNm']['_text'],
                            houseManageNo: Number(info[i]['houseManageNo']['_text']),
                            houseName: info[i]['houseNm']['_text'],
                            winDate: info[i]['przwnerPresnatnDe']['_text'],
                            receptStartDate: info[i]['rceptBgnde']['_text'],
                            receptEndDate: info[i]['rceptEndde']['_text'],
                            recruitDate: info[i]['rcritPblancDe']['_text'],
                            rentSection: info[i]['rentSecdNm']['_text'],
                            sido: info[i]['sido']['_text']
                        })
                    }
                }
            })
            console.log(requestUrl);
    
        res.send({ success: 'ok' })
      }
   }catch (error) {
        console.log(error)
    }
});

//접수마감 +14일에 삭제되는 로직
router.get('/status', async(req, res,next)=>{
    // let newDate = new Date();
    // let year = newDate.getFullYear();
    // let month = newDate.getMonth()+1;
    // let date = newDate.getDate();
    // const sDate = year+''+month+''+date;
    // let status ='';
    // console.log(sDate);
    // console.log(typeof sDate)

    // try{
    //     const Date = await PrivateApt.findAll({
    //         attributes :['recruitDate', 'receptStartDate','receptEndDate'],
    //         raw:true
    //     });
       

    //     for(i in Date){
    //         console.log(Date[i]['recruitDate'])
    //         if(Date[i]['recruitDate']===sDate){
    //             status = '공고중'
    //         }else if(Number(Date[i]['recruitDate'])< Number(Date[i]['receptStartDate'])){
    //             status ='공고중'
    //         }else if(Date[i]['receptStartDate'] ===sDate && Number(Date[i]['receptEndDate'])<=Number(sDate)){
    //             status ='접수중'
    //         }else{
    //             status ='접수마감'
    //         }
    //     }
    //     res.send({status: status});
    // }catch(err){
    //     console.log(err);
    // }
   
});
module.exports = router;