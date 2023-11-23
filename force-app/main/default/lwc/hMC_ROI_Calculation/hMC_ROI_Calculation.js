import { LightningElement,wire,api,track } from 'lwc';
//import Manpower from '@salesforce/schema/Account.HMC_Man_Power__c';
//import Rent from '@salesforce/schema/Account.HMC_Rent__c';
//import Electricity from '@salesforce/schema/Account.HMC_Electricity__c';
//import Transport from '@salesforce/schema/Account.HMC_Transportations__c';
//import overhead from '@salesforce/schema/Account.HMC_Other_Overheads__c';
//import Annual from '@salesforce/schema/Account.HMC_Annual__c';
 //import BankIntrest from '@salesforce/schema/Account.HMC_Bank_Intrest__c';
 //import Discount from '@salesforce/schema/Account.HMC_Discount__c';
 //import MonthlyEarnings from '@salesforce/schema/Account.HMC_Monthly_Earnings__c';
 //import roiscore from '@salesforce/schema/Account.HMC_ROI_Score1__c';
 import calculationDone from '@salesforce/schema/Account.HMC_ROI_Calculation_Done__c';
 import updateROIData from '@salesforce/apex/HMC_ChecklistManagerController.updateROIData';
 
 import getRoiData from '@salesforce/apex/HMC_ChecklistManagerController.getRoiData';

import FORM_FACTOR from '@salesforce/client/formFactor';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {CloseActionScreenEvent} from 'lightning/actions';
export default class HMC_ROI_Calculation extends LightningElement {
    @api recordId;
    @api objectApiName = 'Account';
    @api testvar;
    @api disableRecord;
    //accrecid;

    width ;
    Discount ; 
    overhead ;
    BankIntrest ;
    Transport ;
    Electricity ;
    Rent ;
    Manpower ;
    Annual ;
    MonthlyEarnings ;

    manpowervar ;
    Rentvar;
    Electricityvar;
    Transportvar;
    overheadvar;
    MonthlyAnnualVar;
    StockVar;
    CompanyCreditVar;
    InvestmentVar;ROI
    BankIntrestvar;
    discountvar;
    TotalMonthlyvar;
    TotalAnnualvar;
    manpowervarTot;
    RentvarTot;
    ElectricityvarTot;
    overheadvarTot;
    TransportvarTot;
    MonthlyEarningsVar;
     NetMonthlyEarningsVar = 0;
     NetMonthlyEarningsOnInvestVar = 0;
     NoOfRotationsvar = 0;
     ROIvar = 0;
     SaveCheck = false;
    // ROI = ROIvar;

    handleonchangemanpower(event){
     let x  = event.target.value;
       this.Manpower = x ;
       this.manpowervar = x*12 ;
       this.handleonchangeTotalcount();
       this.handleSave();
    }
    handleonchangeRent(event){
      let x  = event.target.value;
      this.Rent = x ;
        this.Rentvar = x*12 ;
        this.handleonchangeTotalcount();
        this.handleSave();
     }
     handleonchangeElectricity(event){
        let x  = event.target.value;
        this.Electricity = x;
          this.Electricityvar = x*12 ;
          this.handleonchangeTotalcount();
          this.handleSave();
       }
       handleonchangeTransport(event){
        let x  = event.target.value;
        this.Transport = x ;
          this.Transportvar = x*12 ;
          this.handleonchangeTotalcount();
          this.handleSave();
       }
       handleonchangeoverhead(event){
        let x  = event.target.value;
         this.overhead = x;
          this.overheadvar = x*12 ;
          this.handleonchangeTotalcount();
          this.handleSave();
       }
       anualBusiness;
       handleonchangeAnnual(event){
        let x  = event.target.value;
        this.anualBusiness=event.target.value;
         this.Annual = x ;
          this.MonthlyAnnualVar = x/12 ;
          this.StockVar =  this.MonthlyAnnualVar * 2;
          this.CompanyCreditVar = this.MonthlyAnnualVar;
          this.InvestmentVar = this.StockVar - this.CompanyCreditVar;
          //this.NoOfRotationsvar = x / this.InvestmentVar;
          this.handleonchangeTotalcount();
          this.handleSave();
       }
       handleonchangeBankIntrest(event){
        let x  = event.target.value;
        this.BankIntrest = x ;
          this.BankIntrestvar = (this.InvestmentVar* x) / 100;
          this.handleonchangeTotalcount();
          this.handleSave();
       }
       handleonchangeDiscount(event){
        let x  = event.target.value;
          this.Discount = x ; 
          this.discountvar = (this.MonthlyAnnualVar* x) / 100;
          this.handleonchangeTotalcount();
          this.handleSave();
       }
       handleonchangeTotalcount(){
         
          this.TotalMonthlyvar = this.BankIntrestvar +  this.discountvar + (this.overheadvar / 12) + (this.Transportvar / 12) + (this.Electricityvar / 12) + (this.Rentvar / 12) + (this.manpowervar / 12);
          this.TotalAnnualvar = this.TotalMonthlyvar * 12;//this.overheadvar + this.Transportvar + this.Electricityvar + this.Rentvar + this.manpowervar ;
          if(this.MonthlyEarningsVar != null){
            this.NetMonthlyEarningsVar =  this.MonthlyEarningsVar - this.TotalMonthlyvar ;
            this.NetMonthlyEarningsOnInvestVar = (this.NetMonthlyEarningsVar / this.InvestmentVar)*100;
            this.NoOfRotationsvar = (this.MonthlyAnnualVar * 12) / this.InvestmentVar;
            this.ROIvar =  (this.NoOfRotationsvar * this.NetMonthlyEarningsOnInvestVar * 100)/100;
            this.handleSave();
          }
       }
       monthEarn;

       handleonchangeMonthlyEarnings(event){
        let x  = event.target.value;
        this.monthEarn=event.target.value;
        if (isNaN(this.TotalMonthlyvar)) {
          this.TotalMonthlyvar = 0;
        }
        if (isNaN(this.MonthlyEarningsVar)) {
          this.MonthlyEarningsVar = 0;
        }
        if (isNaN(this.InvestmentVar)) {
          this.InvestmentVar = 0;
        }
        if (isNaN(this.MonthlyAnnualVar)) {
          this.MonthlyAnnualVar = 0;
        }
        this.MonthlyEarnings = x;
          this.MonthlyEarningsVar = (this.MonthlyAnnualVar* x)/100;
          //console.log('TotalMonthlyvar'+this.TotalMonthlyvar);
          if(this.TotalMonthlyvar == undefined){
             this.TotalMonthlyvar = 0;
          }
          if(this.MonthlyEarningsVar == undefined){
            this.MonthlyEarningsVar = 0;
         }
          //console.log('MonthlyEarningsVar'+this.MonthlyEarningsVar);
          this.NetMonthlyEarningsVar =  this.MonthlyEarningsVar - this.TotalMonthlyvar ;
          this.NetMonthlyEarningsOnInvestVar = (this.NetMonthlyEarningsVar / this.InvestmentVar)*100;
          this.NoOfRotationsvar = (this.MonthlyAnnualVar * 12) / this.InvestmentVar;
          this.ROIvar =  (this.NoOfRotationsvar * this.NetMonthlyEarningsOnInvestVar * 100)/100;
          this.handleSave();
       }
       getReturn;
       handlesaveRecord(event){
        this.isLoading = true;
       // alert(this.monthEarn);
        //alert(this.anualBusiness);
        console.log(this.anualBusiness);
        console.log(this.monthEarn);


        if( this.monthEarn == ""  || this.anualBusiness == ""){
          const evt = new ShowToastEvent({
            title: 'Toast Error',
            message: 'Please fill Annual Business & Monthly Earnings',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
        
        }
        else if(this.monthEarn == undefined  || this.anualBusiness == undefined){
          const evt = new ShowToastEvent({
            title: 'Toast Error',
            message: 'Please fill Annual Business & Monthly Earnings',
            variant: 'error',
            mode: 'dismissable'
        });
        this.dispatchEvent(evt);
        }else{
          updateROIData({recordId: this.recordId,roi:this.ROIvar,manpowervar: this.Manpower, Rentvar:this.Rent, Electricityvar:this.Electricity, Transportvar:this.Transport, overheadvar:this.overhead, MonthlyAnnualVar:this.Annual, BankIntrestvar:this.BankIntrest, discountvar:this.Discount, MonthlyEarningsVar :this.MonthlyEarnings})
          .then(result =>{
            this.getReturn=result;
            this.isLoading = false;
            //alert(result);
            console.log(this.getReturn);
            if(this.getReturn=='updateDone'){
              const evt = new ShowToastEvent({
                title: 'Toast Success',
                message: 'Record has been updated successful',
                variant: 'success',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
            window.location.reload();
               //   this.template.querySelector('lightning-record-edit-form').submit(this.template.querySelector('lightning-record-edit-form').fields);
                  this.closeQuickAction();//
                  //this.contacts = result;
            }
            else if(this.getReturn=='updateNotDone'){
              const evt = new ShowToastEvent({
                title: 'Toast Error',
                message: 'Record not update',
                variant: 'error',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
            }
           
          })
          .catch(error =>{
              //this.errorMsg = error;
          })
        }
       
          
            
        }
        handleSave(){
          debugger;
          console.log('this.MonthlyAnnualVar'+this.MonthlyAnnualVar);
          console.log('this.manpowervar'+this.manpowervar);
          console.log('this.Rentvar'+this.Rentvar);
          console.log('this.BankIntrestvar'+this.BankIntrestvar);
          console.log('this.discountvar'+this.discountvar);
          console.log('this.Electricityvar'+this.Electricityvar);
          console.log('this.MonthlyEarningsVar'+this.MonthlyEarningsVar);
          console.log('this.Transportvar'+this.Transportvar);
          console.log('this.overheadvar'+this.overheadvar);
          this.SaveCheck = false;
          if(this.ROIvar == null){//this.manpowervar > 0   && this.Rentvar > 0  && this.Electricityvar > 0  && this.Transportvar > 0  && this.overheadvar > 0  
            //&& this.BankIntrestvar > 0  && this.discountvar > 0  && this.MonthlyEarningsVar > 0  && this.MonthlyAnnualVar > 0 ){
              this.SaveCheck = true;
          }
        }
        closeQuickAction() {
            this.dispatchEvent(new CloseActionScreenEvent());
        }
        //Connected Callback
        @wire(getRoiData,{recordId:'$recordId'}) wiredRecord1({ error, data }) {
          console.log('in method');
          if (data) {
              console.log(data);
              console.log('in method if');
            
    
              this.Manpower = data.HMC_Man_Power__c;
              this.manpowervar = data.HMC_Man_Power__c*12;
              this.Rent = data.HMC_Rent__c;
              this.Rentvar = data.HMC_Rent__c*12;
              this.Electricity = data.HMC_Electricity__c;
              this.Electricityvar = data.HMC_Electricity__c * 12;
              this.Transport = data.HMC_Transportations__c;
              this.Transportvar = data.HMC_Transportations__c*12;
              this.overhead = data.HMC_Other_Overheads__c;
              this.overheadvar = data.HMC_Other_Overheads__c*12;
              this.Annual = data.HMC_Annual__c;
              this.MonthlyAnnualVar = data.HMC_Annual__c/12;
              this.StockVar =  this.MonthlyAnnualVar * 2;
              this.CompanyCreditVar = this.MonthlyAnnualVar;
              this.InvestmentVar = this.StockVar - this.CompanyCreditVar;
              this.NoOfRotationsvar += data.HMC_Annual__c / this.InvestmentVar;
              this.BankIntrest = data.HMC_Bank_Intrest__c;
              this.Discount = data.HMC_Discount__c;
              this.MonthlyEarnings = data.HMC_Monthly_Earnings__c;
              this.BankIntrestvar = (this.InvestmentVar*data.HMC_Bank_Intrest__c)/100;
              this.discountvar = (this.MonthlyAnnualVar*data.HMC_Discount__c)/100;
              /* alert('discount '+this.discountvar);
              alert('BankIntrestvar '+this.BankIntrestvar);
              alert('manpowervar '+this.manpowervar);
              alert('Rentvar '+this.Rentvar);
              alert('Electricityvar '+this.Electricityvar);
              alert('Transportvar '+this.Transportvar);
              alert('overheadvar '+this.overheadvar); */
              this.TotalMonthlyvar = (this.discountvar + this.BankIntrestvar + (this.manpowervar)/12 + (this.Rentvar)/12 + (this.Electricityvar)/12 + (this.Transportvar)/12 + (this.overheadvar)/12);
              //alert('total monthly'+this.TotalMonthlyvar);
              this.TotalAnnualvar = this.TotalMonthlyvar * 12;
              //alert('total Annual'+this.TotalAnnualvar);
              this.MonthlyEarningsVar = (this.MonthlyAnnualVar*data.HMC_Monthly_Earnings__c)/100;

              this.NetMonthlyEarningsVar =  this.MonthlyEarningsVar - this.TotalMonthlyvar ;
              this.NetMonthlyEarningsOnInvestVar += (this.NetMonthlyEarningsVar / this.InvestmentVar) * 100;
              this.ROIvar +=  (this.NoOfRotationsvar * this.NetMonthlyEarningsOnInvestVar * 100)/100;
              if (isNaN(this.NoOfRotationsvar)) {
                this.NoOfRotationsvar = 0;
              }if (isNaN(this.NetMonthlyEarningsOnInvestVar)) {
                this.NetMonthlyEarningsOnInvestVar = 0;
              }
              if (isNaN(this.ROIvar)) {
                this.ROIvar = 0;
              }
              if (isNaN(this.manpowervar)) {
                this.manpowervar = 0;
              }
              if (isNaN(this.Rentvar)) {
                this.Rentvar = 0;
              }
              if (isNaN(this.Electricityvar)) {
                this.Electricityvar = 0;
              }
              
              if (isNaN(this.Transportvar)) {
                this.Transportvar = 0;
              }
              if (isNaN(this.overheadvar)) {
                this.overheadvar = 0;
              }
              if (isNaN(this.MonthlyAnnualVar)) {
                this.MonthlyAnnualVar = 0;
              }
              if (isNaN(this.BankIntrestvar)) {
                this.BankIntrestvar = 0;
              }
              
              
          }else if (error) {
              console.log('in method error'+error.body.message);
          } 
      }
      /////////////////////////

       /* handleOnLoad(event){
          console.log('accrecid'+this.recordId);
            var record = event.detail.records;
            //var fields = record[this.recordId].fields; accrecid 
            var fields = record[this.recordId].fields;
            const manpower = fields.HMC_Man_Power__c.value;      
            this.manpowervar = manpower*12;
            const rent = fields.HMC_Rent__c.value;      
            this.Rentvar = rent*12;
            const electricity = fields.HMC_Electricity__c.value;      
            this.Electricityvar = electricity*12;
            const Transport = fields.HMC_Transportations__c.value;      
            this.Transportvar = Transport*12;
            const overHead = fields.HMC_Other_Overheads__c.value;      
            this.overheadvar = overHead*12;
            const Annual = fields.HMC_Annual__c.value;      
            this.MonthlyAnnualVar = Annual/12;
            this.StockVar =  this.MonthlyAnnualVar * 2;
            this.CompanyCreditVar = this.MonthlyAnnualVar;
            this.InvestmentVar = this.StockVar - this.CompanyCreditVar;
           
            this.NoOfRotationsvar += Annual / this.InvestmentVar;
            const BankIntrest = fields.HMC_Bank_Intrest__c.value;      
            this.BankIntrestvar = (this.InvestmentVar*BankIntrest)/100;
            const Discount = fields.HMC_Discount__c.value;      
            this.discountvar = (this.MonthlyAnnualVar*Discount)/100;

            this.TotalMonthlyvar = this.discountvar + this.BankIntrestvar + manpower + rent + electricity + Transport + overHead;
            this.TotalAnnualvar = this.TotalMonthlyvar * 12;

            const MonthlyEarnings = fields.HMC_Monthly_Earnings__c.value;      
            this.MonthlyEarningsVar = (this.MonthlyAnnualVar*MonthlyEarnings)/100;
            this.NetMonthlyEarningsVar =  this.MonthlyEarningsVar - this.TotalMonthlyvar ;
            this.NetMonthlyEarningsOnInvestVar += (this.NetMonthlyEarningsVar / this.InvestmentVar) * 100;
            this.ROIvar +=  (this.NoOfRotationsvar * this.NetMonthlyEarningsOnInvestVar * 100)/100;
            
            if (isNaN(this.NoOfRotationsvar)) {
              this.NoOfRotationsvar = 0;
            }if (isNaN(this.NetMonthlyEarningsOnInvestVar)) {
              this.NetMonthlyEarningsOnInvestVar = 0;
            }
            if (isNaN(this.ROIvar)) {
              this.ROIvar = 0;
            }
            this.handleSave();
        }*/
        handleSuccess(event){
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record saved successfully!',
                    variant: 'success',
                }),
            );
            this.closeQuickAction();
        }
}