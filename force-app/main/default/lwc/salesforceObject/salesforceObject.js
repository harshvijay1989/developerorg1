import { LightningElement, track, wire,api } from 'lwc';
import getObjectRecords from '@salesforce/apex/ObjectListController.getObjectRecords';
import getEmailTemplates from '@salesforce/apex/ObjectListController.getEmailTemplates';
import sendSelectedIdsToApex from '@salesforce/apex/ObjectListController.fetchEmails';
import { NavigationMixin } from 'lightning/navigation';
import getObjectNames from '@salesforce/apex/ObjectListController.getObjectList';
import getEmailFields from '@salesforce/apex/ObjectListController.getEmailFields';
import fetchDataFromApex from '@salesforce/apex/ObjectListController.fetchDataFromApex';
//import singleEmail from '@salesforce/apex/ObjectListController.singleEmail';
import sendEmailTemplate from '@salesforce/apex/ObjectListController.sendEmailTemplate';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class MassEmail extends LightningElement {
    @api salesforceobj ;
     @api label = 'Email Template Name';
    @api placeholder = 'search...'; 
    @api iconName = 'standard:account';
    @api sObjectApiName = 'Account';
    @api defaultRecordId = '';
    searchTimeout;
    // private properties 
    lstResult = []; // to store list of returned records   
    hasRecords = true; 
    searchKey=''; // to store input field value    
    isSearchLoading = false; // to control loading spinner  
    delayTimeout;
    selectedRecord = {};


   @track emailSubject = '';
    @track isDocOpen = true;
    @track showDataTable = false;
    //@track selectedObject = '';
    @track objectOptions = [];
    @track tableData = [];
    @track selectedRows = [];
    //@track isModalOpen = false;
    @track EmailtemplateModal = false;
    @track selectedEmailTemplate = '';
    @track emailTemplateOptions = [];
    @track selectedEmailField = [];
    @track emailFieldOptions = [];
    @track EnablePicklist = false;
    @track tableColumns =[];
    @track createTemplateModal = false;
    @track lookupTemplateModal = false;
    @track selectedModalOption = ''; // Store the selected option
    @track EmailModaloptions = [
        { label: 'Create Template', value: 'createTemplate' },
        { label: 'Select Email Template', value: 'selectEmailTemplate' }
    ];

    handleOptionChange(event) {
        this.selectedModalOption = event.detail.value;
        
        if(this.selectedModalOption == 'createTemplate'){
            console.log('if');
                this.EmailtemplateModal = false;
                this.createTemplateModal = true;
        }
        else if(this.selectedModalOption == 'selectEmailTemplate'){
            console.log('elseif');
            this.EmailtemplateModal = false;
            
            this.lookupTemplateModal = true;
           //   this.loadEmailTemplates();
        }
        this.selectedModalOption ='';
        // You can perform actions based on the selected option here
    }
    

    fetchEmailFields() {
        getEmailFields({ objectApiName: this.selectedObjectName })
            .then((result) => {
                this.tableData ='';
                this.selectedEmailField = [];
                this.showDataTable = false;
                this.EnablePicklist = true;
                this.emailFieldOptions = result.map((emailField) => ({
                    label: emailField,
                    value: emailField,
                }));
            })
            .catch((error) => {
                // Handle error
            });
    }
    
    
    
    // Handle change in selected email field
    handleEmailFieldChange(event) {
        this.selectedEmailField = event.target.value;
        console.log('selectedEmailField',this.selectedEmailField[0]);
        this.tableColumns = this.selectedEmailField.map((field) => {
        return {
            label: field,
            fieldName: field,
            type: 'text',
            sortable: true,
            };
        });
        this.tableColumns.push({
            label: 'Custom Action',
            type: 'button',
            initialWidth: 135, 
            typeAttributes: {
                label: 'Send Email',
                title: 'Send Email',
                name: 'customAction',
                value: 'send_email',
                variant: 'brand', 
                disabled: false, 
            },
        });
    }
    
    handleButtonClick(){
        this.listOfSingleEmails =[];
        fetchDataFromApex({ selectedFields: this.selectedEmailField, objectApiName: this.selectedObjectName  })
            .then((result) => {
                if(result != ''){
                    this.EnablePicklist = false;
                
                    this.showDataTable = true;
                    this.tableData = result; 
                }else{
                    const evt = new ShowToastEvent({
                        title: '',
                        message: 'Record Not Found',
                        variant: 'error',
                        mode: 'dismissable'
                    });
                    this.dispatchEvent(evt);
                }
                
                
            })
            .catch((error) => {
            console.error('Error fetching data from Apex: ', error);
            });

    }    

 handleObjectChange() {
        
        this.selectedObject = this.selectedObjectName;//event.detail.value;
        
        this.fetchEmailFields();
        // getObjectRecords({ selectedObject: this.selectedObject })
        //     .then(result => {
        //        
        //         //alert(result);
        //         this.tableData = result;
        //     })
        //     .catch(error => {
        //         //alert(error);
        //         // Handle any errors here
        //         console.error('Error fetching records: ' + error);
        //     });
    }

   

    @track listOfSingleEmails = [];
    
    callRowAction(event) {
        this.listOfSingleEmails = [];
        this.EmailtemplateModal = true;
        
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'customAction') {
           
            const email = row.Email;
            this.listOfSingleEmails.push(email);
          
            this.selectedObject = false;
                    this.isModalOpen = true;
                    this.error = undefined;
        } else {
            // Handle other row actions if needed
        }

    }
    
    hideModal() {  
        this.selectedObjectName = '';
        this.selectedSearchResult = '';
        this.searchResults = '';
        this.EmailtemplateModal = false;
        this.showDataTable = false;
        this.tableData = [];
    }

    mainScreen(){
        this.EmailtemplateModal = false;
    }

    hideCreateModalBox(){
        this.tableData = [];
        this.showDataTable = false;
         this.selectedObjectName = '';
        this.selectedSearchResult = '';
        this.searchResults = '';
        this.selectedModalOption ='';
        this.createTemplateModal = false;
    }

    // hideLookupModal(){
    //     this.lookupTemplateModal = false;
    // }

    // create template 
    handleSubjectChange(event){
        this.emailSubject = event.target.value;
        
    }

    handleBodyChange(event){
        this.emailBody = event.target.value;
        
       
    }

    // send Email to single customer 
    handleCreateCustomTemplate(){
        this.createTemplateModal = false;
        this.showDataTable = false;
        this.tableData = [];
         this.selectedObjectName = '';
        this.selectedSearchResult = '';
        this.searchResults = '';
        
        console.log('ready to move', JSON.stringify(this.listOfSingleEmails));
        
            sendEmailTemplate({ toAddress : this.listOfSingleEmails, subject : this.emailSubject , body : this.emailBody})
            .then((result) => {
                const event = new ShowToastEvent({
                title: ' ',
                message: 'Email Sent Successfully',
                variant: 'success',
                mode: 'dismissable'
            });
            this.dispatchEvent(event);
                
                console.log('Result'+result);
               // this.contacts = result;
            })
            .catch((error) => {
                this.error = error;
            });
        this.emailSubject ='';
       
    }

    // send Email to customer 

    handleEmail(){
        this.selectedObjectName = '';
        this.selectedSearchResult = '';
        this.searchResults = '';
        if(this.listOfSingleEmails != null && this.ids != null){
            sendSelectedIdsToApex({ selectedEmails: this.listOfSingleEmails , templateId: this.ids })
            .then((result) => {
                this.isDocOpen = true;
                this.contacts = result;
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
                this.contacts = undefined;
            });

            const event = new ShowToastEvent({
                title: ' ',
                message: 'Email Sent Successfully',
                variant: 'success',
                mode: 'dismissable'
            });
            this.dispatchEvent(event);

        }else{
            const evt = new ShowToastEvent({
                title: 'Toast Error',
                message: 'Email not sent',
                variant: 'error',
                mode: 'dismissable'
            });
            this.dispatchEvent(evt);
        }
        
        }

        // multiple customer send Email

        handleRowAction(event) {
            
            const selectedRows = event.detail.selectedRows;
            console.log('selectedRows'+JSON.stringify(selectedRows));
            const emailList = [];
    
            for (let i = 0; i < selectedRows.length; i++) {
                const email = selectedRows[i].Email; // Replace 'Email' with the actual API name of the email field in your data
                if (email) {
                    
                    emailList.push(email);
                    this.listOfSingleEmails = emailList;
                    
                }
            }
    
        console.log('Selected Emails: ==>>>>', JSON.stringify(emailList));
        //this.listOfSingleEmails.push(...emailList);
        //this.listOfEmails.push(...emailList);
        console.log('listOfSingleEmails: ==>>>>', JSON.stringify(this.listOfSingleEmails));
        }

        handleSendMultipleEmail(){
            //console.log('Enater=',JSON.stringify(this.listOfSingleEmails));
            if(this.listOfSingleEmails.length>0){
                //alert('true');
                //this.showDataTable = false;
                this.EmailtemplateModal = true;
                this.openEmailTemplateModal();
                
                //this.tableColumns = [];
            }else{
                const event = new ShowToastEvent({
                    message: 'Please Select Email',
                    variant: 'Error',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);
            }

           

        }

        // work pending here

       

        


         





















     @wire(getEmailTemplates)
    emailTemplates({ error, data }) {
        if (data) {
            
            this.emailTemplateOptions  = data.map(template => ({
                label: template.Name,
                value: template.Id
            }));
           // this.emailTemplateOptions  = JSON.stringify(data);
        } else if (error) {
            
        }
    }
    handleTemplateChange(event) {
        this.selectedEmailTemplate = event.detail.value;
    }

   selectPickListBack(){
       this.createTemplateModal = false;
       this.EmailtemplateModal = true;
   }
   
    

   


    openEmailTemplateModal() {
         console.log('open modal');
         
         this.selectedObject = false;
        this.isModalOpen = true;
    }

    @track ids='';
    @track Status = false;
    @track clearAllList = false;
    lookupRecord(event){
        
        console.log('event.isDocOpen ===> ',event.detail.isDocOpen);
        console.log(event.detail.detail);
         //this.lookupTemplateModal = event.detail.detail;
          this.lookupTemplateModal = event.detail.emailTemplateModalClose;
          
          //this.lookupTemplateModal = event.detail.closeScreen;
          this.EmailtemplateModal = event.detail.selectEmailTemplateFalse;
          this.EmailtemplateModal = event.detail.emailtemplateModalEnable;
          if(this.EmailtemplateModal == false){
              this.tableData = [];
              this.showDataTable = false;
          }
            this.clearAllList = event.detail.clearAllList;
            if(this.clearAllList == true){
                this.selectedObjectName = '';
                this.selectedSearchResult = '';
                this.searchResults = '';
            }
          //this.lookupTemplateModal =  event.detail.emailtemplateModalEnableBack; 
           
         this.ids =event.detail.ids;
         console.log('id come'+this.ids);
         this.lookupTemplateModal = event.detail.sendEmailAndCloseLookup;
        
          
         this.status= event.detail.sendEmailAndClose;
          
         
         if(this.status == true){
            console.log('Enter if condition');
            this.handleEmail();
         }
         console.log('event.ids ---> '+event.detail.ids);
         //alert(this.isDocOpen);
    }
    get vfPgaeUrl() {
        
        // Construct the URL correctly
        const vfPageBaseUrl = 'https://crmlandingsoftware6-dev-ed--c.develop.vf.force.com/';
        const vfPagePath = '/apex/massEmailVfPage';
        const devConsoleParam = 'core.apexpages.request.devconsole=1';
        return `${vfPageBaseUrl}${vfPagePath}?${devConsoleParam}`;
    }

    

















    picklistOrdered;
    @track searchResults = '';
    @track selectedSearchResult = '';
    @track selectedObjectName;
    @track objectFieldDisable = true;

    @track isShowModal = true;

    showModalBox() {
        this.isShowModal = true;
    }
    hideModalBox() {
        this.selectedObject = true;
        console.log("csncel");
        this.selectedObjectName = '';
        this.selectedSearchResult = '';
        this.searchResults = '';
        console.log("selected result ",this.searchResults);
        
        // Navigate to the list view
        this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Document_Template__c',
                    actionName: 'list'
                },
                state: {
                    filterName: 'Recent'
                },
            });
    }
    get selectedValue() {
        //alert();
        return this.selectedSearchResult ? this.selectedSearchResult.label : null;
    }
    connectedCallback() {
        getObjectNames()
            .then((result) => {
                console.log("connetced ");
                //this.searchResults=null;
                //this.selectedObjectName= "";
                var temp = [];
                for (var i = 0; i < result.length; i++) {
                    temp.push({ label: result[i].label, value: result[i].value });
                }
                this.picklistOrdered = temp;
                this.picklistOrdered = this.picklistOrdered.sort((a, b) => {
                    if (a.label < b.label) {
                        return -1
                    }
                })
                this.objectFieldDisable = false;
            })
            
    }
    search(event) {
        // Clear any previous timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        const input = event.detail.value.toLowerCase();

        // Set a new timeout to execute the search after a delay (e.g., 500 milliseconds)
        this.searchTimeout = setTimeout(() => {
            const result = this.picklistOrdered.filter((picklistOption) =>
                picklistOption.label.toLowerCase().includes(input)
            );
            this.searchResults = result;
        }, 50); // Adjust the delay time as needed
    }
    // search(event) {
    //     const input = event.detail.value.toLowerCase();
    //     const result = this.picklistOrdered.filter((picklistOption) =>
    //         picklistOption.label.toLowerCase().includes(input)
    //     );
    //     this.searchResults = result;
    // }
    @track selectObjName = '';
    selectSearchResult(event) {
        const selectedValue = event.currentTarget.dataset.value;
        this.selectObjName = event.currentTarget.dataset.value;
        this.searchResults = this.selectObjName;
        
        this.selectedObjectName=selectedValue;
        this.selectedSearchResult = this.picklistOrdered.find(
            (picklistOption) => picklistOption.value === selectedValue
        );
       
        this.clearSearchResults();
    }
    clearSearchResults() {
        //this.selectedSearchResult = '';
        this.searchResults = null;
        this.handleObjectChange();
    }

    // invoked onblue for set object; 
    clearObjectValue(event) {
        event.target.value = this.selectedValue;
    }
    showPicklistOptions() {
        if (!this.searchResults) {
            this.searchResults = this.picklistOrdered;
        }
    }
    handleNextClick() {
        if(this.selectedObjectName=='' || this.selectedObjectName == null || this.selectedObjectName==undefined ){
            const event = new ShowToastEvent({
                message: 'Please Select Object',
                variant: 'Warning',
                mode: 'dismissable'
            });
            this.dispatchEvent(event); 

        }else{
            this.isShowModal=false;
            this.isEditorCmp=true;
        }
        
    }
    
    
}