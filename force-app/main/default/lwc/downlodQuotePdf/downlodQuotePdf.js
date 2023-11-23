import { LightningElement,api } from 'lwc';

export default class DownlodQuotePdf extends LightningElement {
    @api recordId;

    @api vflink; 
  connectedCallback() {
    setTimeout(() => {
        this.vflink='https://3dboost2--dev1.sandbox.lightning.force.com/apex/CustomQuotePDF?Id='+ this.recordId; 
        
    }, 2000);
}


}