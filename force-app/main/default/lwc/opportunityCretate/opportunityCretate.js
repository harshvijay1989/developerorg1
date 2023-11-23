import { LightningElement } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import saveProduct from '@salesforce/apex/demo1.saveProduct';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class OpportunityCretate extends LightningElement {
    showNewPage = false
    shownewpage2=false;
    PName='';
    isActive=false;
    ProductCode='';
    ProductType='';
    productdes='';
    unitPrice='';
      options = [
        { label: 'Communication Devices', value: 'Communication Devices' },
        { label: 'Colourless to yellowish clear liquid', value: 'Colourless to yellowish clear liquid.' },
        // Add more options as needed
    ];
    handleClick() {
        this.showNewPage = true;

    }

    closeNewModal() {
        this.showNewPage = false;
         this.shownewpage2=false;
    }

    closeModal(){


       this.dispatchEvent(new CloseActionScreenEvent());
    }

    handleClickNEW(){
        this.shownewpage2=true;
    }
  
   handleProductName(event) {
        this.PName = event.target.value;
        console.log("Product name: " + this.PName);
    }

    handleActive(event) {
        this.isActive = event.target.checked;
        console.log("Is Active? " + this.isActive);
    }

    handleProductCode(event){
      this.ProductCode=event.target.value;
      
    }

    handleProductType(event){
        this.ProductType=event.target.value;
    }

    handleproductdes(event){
        this.productdes=event.target.value;

    }
    handleUnitPrice(event){
        this.unitPrice=parseFloat(event.target.value);
        

    }
   
  handleSave() {
    const productData = {
        PName: this.PName,
        isActive: this.isActive,
        ProductCode: this.ProductCode,
        productdes: this.productdes,
        ProductType: this.ProductType
    };

    const productDataJSON = JSON.stringify(productData);

    console.log('JOSN Data=>'+productDataJSON);

    

    this.shownewpage2 = false;
}

  handleSave() {
    const productData = {
        PName: this.PName,
        isActive: this.isActive,
        ProductCode: this.ProductCode,
        productdes: this.productdes,
        ProductType: this.ProductType,
        unitPrice:this.unitPrice
    };

    const productDataJSON = JSON.stringify(productData);

    console.log('JOSN Data=>'+productDataJSON);
          saveProduct({ data1: productDataJSON })
            .then(result => {
                console.log('Product saved:', result);
                this.showToast('success', 'Product Saved', result);
            })
            .catch(error => {
                console.error('Error saving product:', error);
                this.showToast('error', 'Error', 'Error saving product.');
            });

        this.shownewpage2 = false;
    }

    showToast(variant, title, message) {
        const event = new ShowToastEvent({
            variant: variant,
            title: title,
            message: message,
        });
        this.dispatchEvent(event);
    }
}