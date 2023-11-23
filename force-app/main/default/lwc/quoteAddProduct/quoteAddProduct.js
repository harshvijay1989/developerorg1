import { LightningElement, track, wire, api } from 'lwc';
import findProducts from '@salesforce/apex/QuoteAddProductController.findProducts';
import saveProducts from '@salesforce/apex/QuoteAddProductController.saveProducts';
import getproductfamily from '@salesforce/apex/QuoteAddProductController.getproductfamily';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import doCheck from '@salesforce/apex/QuoteAddProductController.doCheck';
import { RefreshEvent } from 'lightning/refresh';
import { refreshApex } from "@salesforce/apex";
import { CloseActionScreenEvent } from 'lightning/actions';
import modal from "@salesforce/resourceUrl/custommodalcss";
import { loadStyle } from "lightning/platformResourceLoader";

const DELAY = 300;

const COLS = [
    { label: 'Product Name', fieldName: 'purl', type: 'url', typeAttributes: { label: { fieldName: 'Name' } } },
    { label: 'Product Code', fieldName: 'ProductCode', type: 'text' },
    { label: 'Unit Price', fieldName: 'Price', type: 'currency' },
    { label: 'Product Description', fieldName: 'Description', type: 'text' },
    { label: 'Product Family', fieldName: 'Family', type: 'text' }
];
export default class AddNewProductCustom extends LightningElement {
    cols = COLS;
    @api recordId;
    @track opportunityProducts = [];
    @track SelectedRecordCount = 0;
    @track isModalOpen = false;
    @track ShowSelected = true;
    @track PriceBook = '';
    @track ShowTableData = [];
    @track selectedProductCode = [];
    @track AllProductData = [];
    @track SelectedProductData = [];
    @track lstResult = [];
    @track hasRecords = true;
    @track searchKey = '';
    @track isSearchLoading = false;
    @track delayTimeout;
    @track isFirstPage = true;
    @track isSecondPage = false;
    @track selectedRows = [];
    @track ShowViewAll = false;
    @track datafilterval = false;
    @track prodfamilylst = [];
    @track FilterForm = { "ProductFamily": "" };
    @track isProductSelect = true;
    @track isLoading = false;
    mapIdQuantity;
    mapIdSalesPrice;
    mapIdDate;
    mapIdLineDescription;
    @track showErrorMsg = false;
    @track filteredData = [];
    @track DisableNext = true;


    @track selectedRows = [];

    async connectedCallback() {
        // this.openModal();



        this.isLoading = true;

        this.mapIdQuantity = new Map();
        this.mapIdSalesPrice = new Map();
        this.mapIdDate = new Map();
        this.mapIdLineDescription = new Map();
        this.getproductfamily();
        await findProducts({ recordId: this.recordId, name: this.searchKey, productCode: '', productFamily: [], RecordLimit: 10 }).then(result => {
            console.log('connectedCallback = ', result);
            let dataObj = JSON.parse(result);
            console.log(dataObj);
            this.AllProductData = dataObj.productList;
            this.ShowTableData = dataObj.productList;
            this.PriceBook = dataObj.priceBook;
        });
        this.isLoading = false;
        loadStyle(this, modal);
        this.doCheckData();
    }

    doCheckData() {
        doCheck({ recIds: this.recordId })
            .then(result => {
                console.log('check Records', result);
                var data = [];
                result.forEach((item) => {
                    data.push(item.Product__r.Prod_Prod_Code__c);
                })
                console.log('---->' + JSON.stringify(result));

                this.selectedProductCode = data;
                //this.RecalculateselectedProductCode();
                if (this.selectedProductCode.length > 0) {
                    this.DisableNext = false;
                    this.SelectedRecordCount = this.selectedProductCode.length;
                }
                this.opportunityProducts = result;
            })
            .catch(error => {
                this.error = error;
                this.contacts = undefined;
            });
    }

    getproductfamily() {
        //this.isModalOpen = true;
        getproductfamily().then(result => {
            console.log('Productfamily' + result);
            this.prodfamilylst = result;
        });
    }

    get options() {
        return this.prodfamilylst;
    }

    handleChange(event) {
        this.FilterForm[event.target.name] = event.detail.value
    }

    openModal() {
        this.isModalOpen = true;
        findProducts({ recordId: this.recordId, name: this.searchKey, productCode: '', productFamily: [], RecordLimit: 10 }).then(result => {
            console.log(result);
            let dataObj = JSON.parse(result);
            console.log(dataObj);
            this.AllProductData = dataObj.productList;
            this.ShowTableData = dataObj.productList;
            this.PriceBook = dataObj.priceBook;
        });
    }

    handleShowSelected() {

        this.ShowSelected = false;
        console.log('handleShowSelected called...');
        this.ShowTableData = this.SelectedProductData;
        this.ShowViewAll = true;
        this.RecalculateselectedProductCode();
    }

    handleviewAll(event) {
        this.ShowSelected = true;
        this.ShowTableData = this.AllProductData;
        this.ShowViewAll = false;
        this.RecalculateselectedProductCode();
    }

    RecalculateselectedProductCode() {
        this.selectedProductCode = [];
        for (let i = 0; i < this.SelectedProductData.length; i++) {
            this.selectedProductCode.push(this.SelectedProductData[i].ProductCode);
        }
    }

    SelectedProduct(event) {
        console.log('SelectedProduct called..');
        if (true) {
            console.log('true');
            const selRows = event.detail.selectedRows;
            console.log('selRows' + selRows);
            if (this.selectedRows.length < selRows.length) {
                console.log('Selected');
                for (let i = 0; i < selRows.length; i++) {
                    this.selectedProductCode.push(selRows[i].ProductCode);
                    //this.SelectedProductData.push(selRows[i]);
                }
            } else {
                var selectedRowsProductCode = [];
                var selProductCode = [];
                for (let i = 0; i < this.selectedRows.length; i++) {
                    selectedRowsProductCode.push(this.selectedRows[i].ProductCode);
                }
                for (let i = 0; i < selRows.length; i++) {
                    selProductCode.push(selRows[i].ProductCode);
                }
                var deselectedRecProductCode = selectedRowsProductCode.filter(x => selProductCode.indexOf(x) === -1);
                for (let i = 0; i < deselectedRecProductCode.length; i++) {
                    this.selectedProductCode = this.selectedProductCode.filter(function (e) { return e !== deselectedRecProductCode[i] })
                }
            }
            this.selectedRows = selRows;
            this.selectedProductCode = [...new Set(this.selectedProductCode)];
            this.SelectedRecordCount = this.selectedProductCode.length;

            this.SelectedProductData = [];
            for (let i = 0; i < this.selectedProductCode.length; i++) {
                for (let j = 0; j < this.AllProductData.length; j++) {
                    if (this.selectedProductCode.includes(this.AllProductData[j].ProductCode)) {
                        this.SelectedProductData.push(this.AllProductData[j]);
                    }
                }
            }
            this.SelectedProductData = [...new Set(this.SelectedProductData)];
            if (this.selectedProductCode.length > 0) {
                this.DisableNext = false;
            } else {
                this.DisableNext = true;
            }
        }
        this.isProductSelect = true;

    }
    handleNextBustton() {

    }

    closeModal() {
        this.isSecondPage = false;

        this.dispatchEvent(new CloseActionScreenEvent())

        //  this.SelectedRecordCount = 0;

        // this.PriceBook = '';
        // this.ShowTableData = [];
        // this.selectedProductCode =[];
        // this.AllProductData = [];
        // this.SelectedProductData = [];

        // this.lstResult = [];
        // this.hasRecords = true;
        // this.searchKey='';
        // this.isSearchLoading = false;
        // //this.isFirstPage = true;
        // this.isSecondPage = false;
        // this.selectedRows = [];
        // this.ShowViewAll = false;
        // this.ShowSelected = true;
        // this.showErrorMsg = false;
        // this.filteredData = [];
        // this.FilterForm = {"ProductFamily" : ""};
        // this.datafilterval = false;
        this.DisableNext = true;
    }
    nextDetails() {
        this.isFirstPage = false;
        this.isSecondPage = true;
        this.SelectedProductData = [];
        for (let i = 0; i < this.selectedProductCode.length; i++) {
            for (let j = 0; j < this.AllProductData.length; j++) {
                if (this.selectedProductCode.includes(this.AllProductData[j].ProductCode)) {
                    this.SelectedProductData.push(this.AllProductData[j]);
                }
            }
        }
        console.log('selectedProductCode = ', JSON.stringify(this.selectedProductCode));


        console.log('SelectedProductData = ', JSON.stringify(this.SelectedProductData));
        //this.SelectedProductData = [...new Set(this.SelectedProductData)];
        // clearTimeout(this.timeoutId); // no-op if invalid id
        // this.timeoutId = setTimeout(this.updateIndex.bind(this), 1000);


        this.SelectedProductData.forEach((item) => {
            this.opportunityProducts.forEach((data) => {
                if (item.ProductCode == data.Product__r.Prod_Prod_Code__c) {
                    item.Quantity = data.Quantity__c;
                    item.LineDescription = data.LineItemDescription__c;
                    item.PDate = data.QuoteLineDiscount__c;
                }
            })

        })


        const uniqueProductCodes = new Set();
        this.SelectedProductData = this.SelectedProductData.filter((item) => {
            if (!uniqueProductCodes.has(item.ProductCode)) {
                uniqueProductCodes.add(item.ProductCode);
                return true;
            }
            return false;
        });

        clearTimeout(this.timeoutId); // no-op if invalid id
        this.timeoutId = setTimeout(this.updateIndex.bind(this), 1000);

    }

    updateIndex() {

    }

    datafilter() {
        if (this.datafilterval) {
            this.datafilterval = false;
        } else {
            this.datafilterval = true;
        }
    }

    hadleDelete(event) {
        this.template.querySelectorAll('tr').forEach(ele => {
            console.log('ele-----------' + JSON.stringify(ele));
            console.log('event.target.value-----------' + JSON.stringify(event.target.value));
            if (ele.id.includes(event.target.value)) {
                ele.classList.add('slds-hide')
            }
        });
    }

    saveDetails() {
        this.isLoading = true;
        var deletedProducts = []
        this.template.querySelectorAll('tr').forEach(ele => {
            if (ele.classList.value.includes('slds-hide') && !ele.id.includes('firstRow')) {
                var temp = ele.id.split('-');
                if (temp.length > 0) {
                    deletedProducts.push(temp[0]);
                }
            }
        });
        console.log('hiddendProducts = ', deletedProducts);
        for (var i = 0; i < this.SelectedProductData.length; i++) {
            var obj = this.SelectedProductData[i];
            for (var key in obj) {
                var value = obj[key];
                if (key === 'Id') {
                    if (this.mapIdQuantity.get(value) != undefined) {
                        obj.Quantity = this.mapIdQuantity.get(value);
                    }
                    if (this.mapIdSalesPrice.get(value) != undefined) {
                        obj.Price = this.mapIdSalesPrice.get(value);
                    }
                    if (this.mapIdDate.get(value) != undefined) {
                        obj.PDate = this.mapIdDate.get(value);
                    }
                    if (this.mapIdLineDescription.get(value) != undefined) {
                        obj.LineDescription = this.mapIdLineDescription.get(value);
                    }
                }
            }
            this.SelectedProductData[i] = obj;
        }
        var DataToSave = this.SelectedProductData;
        this.SelectedProductData = [];
        var isValidate = true;
        for (var i = 0; i < DataToSave.length; i++) {
            if (!deletedProducts.includes(DataToSave[i]["Id"])) {
                this.SelectedProductData.push(DataToSave[i]);
            }
        }

        for (var i = 0; i < this.SelectedProductData.length; i++) {
            if (this.SelectedProductData[i]["Quantity"] == 0 || this.SelectedProductData[i]["Quantity"] == undefined) {
                isValidate = false;
                break;
            }
        }
        if (isValidate) {
            this.isFirstPage = false;
            console.log(' SelectedProductData ' + JSON.stringify(this.SelectedProductData));
            let str = JSON.stringify(this.SelectedProductData);
            saveProducts({ recordData: str, recId: this.recordId }).then(result => {
                this.selectedRecord = [];
                this.isLoading = false;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Product Added Successfully',
                    variant: 'success',
                }));
                this.dispatchEvent(new CloseActionScreenEvent());
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                //    this.dispatchEvent(new CloseActionScreenEvent());
                //     this.dispatchEvent(new RefreshEvent());
                //     window.location.reload();
                //     eval("$A.get('e.force:refreshView').fire();");




                //     setTimeout(() => {
                //         eval("$A.get('e.force:refreshView').fire();");
                //    }, 1000); 


            })
                .catch(error => {
                    this.isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error Product Adding',
                            message: error.body.message,
                            variant: 'error',
                        }),
                    );
                    //this.updateRecordView();
                    this.closeModal();
                    this.isSecondPage = false;
                });
        } else {
            this.isLoading = false;
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Quantity should be non-Zero',
                variant: 'error',
            }));
        }

    }

    handleback() {
        this.ShowTableData = this.AllProductData;
        this.ShowSelected = true;
        this.isFirstPage = true;
        this.isSecondPage = false;
        mapIdQuantity = '';
        mapIdSalesPrice = '';
        mapIdDate = '';
        mapIdLineDescription = '';

    }

    fillselectedRows() {
        this.selectedRows = []
        for (let i = 0; i < this.ShowTableData.length; i++) {
            if (this.selectedProductCode.includes(this.ShowTableData[i].ProductCode)) {
                console.log('pushed');
                this.selectedRows.push(this.ShowTableData[i]);
            }
        }
    }
    showFilteredProducts(event) {
        console.log('event.keyCode = ', event.keyCode);
        if (event.keyCode == 13) {
            this.isFirstPage = false;
            this.showErrorMsg = false;
            findProducts({ recordId: this.recordId, name: this.searchKey, productCode: '', productFamily: [], RecordLimit: 1000 }).then(result => {
                let dataObj = JSON.parse(result);
                console.log(dataObj);
                this.ShowTableData = dataObj.productList;
                this.filteredData = dataObj.productList;
                this.fillselectedRows();
                this.isFirstPage = true;
                this.ShowViewAll = true;
                this.ShowSelected = true;
                /*const searchBoxWrapper = this.template.querySelector('.lookupContainer');
                searchBoxWrapper.classList.remove('slds-show');
                searchBoxWrapper.classList.add('slds-hide');*/
            });
        } else {
            this.handleKeyChange(event);
            const searchBoxWrapper = this.template.querySelector('.lookupContainer');
            searchBoxWrapper.classList.add('slds-show');
            searchBoxWrapper.classList.remove('slds-hide');
        }
    }

    handleKeyChange(event) {

        this.isSearchLoading = true;
        this.searchKey = event.target.value;
        findProducts({ recordId: this.recordId, name: this.searchKey, productCode: '', productFamily: [], RecordLimit: 5 }).then(result => {
            let dataObj = JSON.parse(result);
            console.log(dataObj);
            this.hasRecords = dataObj.productList.length == 0 ? false : true;
            this.lstResult = dataObj.productList;
            console.log(this.lstResult);
        });
    }


    toggleResult(event) {
        console.log('toggleResult called...');
        const lookupInputContainer = this.template.querySelector('.lookupInputContainer');
        const clsList = lookupInputContainer.classList;
        const whichEvent = event.target.getAttribute('data-source');
        switch (whichEvent) {
            case 'searchInputField':
                clsList.add('slds-is-open');
                break;
            case 'lookupContainer':
                clsList.remove('slds-is-open');
                break;
        }
    }

    handelSelectedRecord(event) {
        console.log(' event.target.dataset ' + JSON.stringify(event.target.dataset));
        console.log(' event.target ' + JSON.stringify(event.target));

        var objId = event.target.dataset.recid;
        console.log(' objId ' + objId);
        const searchBoxWrapper = this.template.querySelector('.lookupContainer');
        searchBoxWrapper.classList.remove('slds-show');
        searchBoxWrapper.classList.add('slds-hide');
        this.selectedRecord = this.lstResult.find(data => data.productCode === objId);
        this.selectedProductCode.push(this.selectedRecord.ProductCode);
        this.SelectedRecordCount += 1;
        this.ShowTableData.push(this.selectedRecord);

        this.handleShowSelected();
    }

    handleQuantityChange(event) {
        var selectedRow = event.currentTarget;
        var key = selectedRow.dataset.targetId;
        console.log(' key ' + key + ' event.target.value ' + event.target.value);
        this.mapIdQuantity.set(key, event.target.value);
    }

    handleSalesPriceChange(event) {

        var selectedRow = event.currentTarget;
        var key = selectedRow.dataset.targetId;
        this.mapIdSalesPrice.set(key, event.target.value);
    }

  handleDateChange(event) {
    var selectedRow = event.currentTarget;
    var key = selectedRow.dataset.targetId;
    var inputValue = event.target.value;

    if (inputValue !== null && inputValue !== undefined && inputValue.trim() !== '') {
        this.mapIdDate.set(key, inputValue);
    } else {
      
        this.mapIdDate.set(key, 0);
    }
}


    handleLineDescriptionChange(event) {
        var selectedRow = event.currentTarget;
        var key = selectedRow.dataset.targetId;
        this.mapIdLineDescription.set(key, event.target.value);
    }

    ApplyFilter() {
        const searchBox = this.template.querySelector('.searchBox');
        if (searchBox.value == '' || searchBox.value == undefined) {
            this.showErrorMsg = true;
        } else {
            this.isFirstPage = false;
            findProducts({ recordId: this.recordId, name: this.searchKey, productCode: '', productFamily: [], RecordLimit: 1000 }).then(result => {
                let dataObj = JSON.parse(result);
                console.log(dataObj);
                this.ShowTableData = dataObj.productList;
                this.filteredData = dataObj.productList;
                this.fillselectedRows();
                this.isFirstPage = true;
                this.ShowViewAll = true;
                this.ShowSelected = true;

                if (this.FilterForm["ProductCode"] != undefined) {
                    var filteredProductData = [];
                    for (let i = 0; i < this.filteredData.length; i++) {
                        if (this.filteredData[i].ProductCode.toLowerCase().includes(this.FilterForm["ProductCode"].toLowerCase())) {
                            if (this.FilterForm["ProductFamily"] != undefined && this.FilterForm["ProductFamily"].length != 0) {
                                for (let j = 0; j < this.FilterForm["ProductFamily"].length; j++) {
                                    console.log('this.ShowTableData[i].Family = ', this.filteredData[i].Family);
                                    if (this.FilterForm["ProductFamily"][j] == this.filteredData[i].Family) {
                                        filteredProductData.push(this.filteredData[i]);
                                        break;
                                    }
                                }
                            } else {
                                filteredProductData.push(this.filteredData[i]);
                            }

                        }
                    }
                    this.showErrorMsg = false;
                    this.ShowTableData = filteredProductData;
                    this.isProductSelect = false;
                    this.fillselectedRows();
                    this.RecalculateselectedProductCode();
                    console.log('filteredProductData = ', filteredProductData);
                } else if (this.FilterForm["ProductFamily"] != undefined && this.FilterForm["ProductFamily"].length != 0) {
                    var filteredProductData = [];
                    for (let i = 0; i < this.filteredData.length; i++) {
                        for (let j = 0; j < this.FilterForm["ProductFamily"].length; j++) {
                            if (this.FilterForm["ProductFamily"][j] == this.filteredData[i].Family) {
                                filteredProductData.push(this.filteredData[i]);
                                break;
                            }
                        }
                    }
                    this.showErrorMsg = false;
                    this.ShowTableData = filteredProductData;
                    this.isProductSelect = false;
                    this.fillselectedRows();
                    this.RecalculateselectedProductCode();
                    console.log('filteredProductData = ', filteredProductData);
                }

            });
        }

    }

    clearFilter() {
        this.FilterForm = { "ProductFamily": "" };
        this.datafilterval = false;
    }

}