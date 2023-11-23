import { LightningElement,api,wire,track } from 'lwc';
import { NavigationMixin } from "lightning/navigation";
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import buttonAndLinksList from '@salesforce/apex/CompactLayoutHelperClass.buttonAndLinksList';
export default class CompactLayout extends NavigationMixin(LightningElement) {
    @api recordId;
    @api objectIconName;
    @api Object;
    @api Title;
    @api Fields = [];
    @track separatedArray = [];
    @track areDetailsVisible = false;
    @track showAddProductButton = false;
    @api objectApiName;
    @track objectInfo;
  
 connectedCallback() {
  //this.Fields = this.temp;
  console.log('this.Fields===> ',this.Fields);
     this.separatedArray = this.Fields.split(',');
     console.log('this.separatedArray===> ',this.separatedArray);
      for(var i = 0; i > this.Fields.length;  i++){
        this.separatedArray.push(this.Fields[i]);
        console.log('this.separatedArray FOR ===> ',this.separatedArray);
      }

      if(this.recordId.substring(0,3) == 'a01'){
        this.showAddProductButton = true;
      }else{
        this.showAddProductButton = false;
      }

      if(this.Object != null && this.Object != ''){
        this.buttonAndLinksList(this.Object);
      }
  }
  buttonAndLinksList(objectName){
    
    buttonAndLinksList({ selectedObject: objectName })
    .then(result => {
      console.log('result ===> ',JSON.stringify(result));
        this.buttonAndLinksListData = result;
        console.log('this.buttonAndLinksListData===> ',this.buttonAndLinksListData);
    }).catch((error) => {
          this.error = error;
       // this.toastMsg('Error retrieving buttonAndLinksList data ', JSON.stringify(error), 'error');
    });
  }
  clickNeButton(){
    console.log('hoo');

    console.log('this.recordId==> ',this.recordId);
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.recordId,
        actionName: "edit",
      },
    });
  }
  clickDeleteButton(){
    console.log('this.recordId==> ',this.recordId);
    this.areDetailsVisible = true;
    
  }
  CancelButton(){
    this.areDetailsVisible = false;
  }

  DeleteButton(){
    deleteRecord(this.recordId)
    .then(() => {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Success",
          message: "Record deleted",
          variant: "success",
        }),
      );
      this.areDetailsVisible = false;
    })
    .catch((error) => {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error deleting record",
          message: 'error',
          variant: "error",
        }),
      );
      this.areDetailsVisible = false;
    });
  }
}