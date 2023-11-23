import { LightningElement,api , track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadStyle } from 'lightning/platformResourceLoader';
import { NavigationMixin } from 'lightning/navigation';
import fileSelectorStyles from '@salesforce/resourceUrl/fileSelectorStyles';
import { refreshApex } from '@salesforce/apex';

import getDocumentAndAccRecordTypes from '@salesforce/apex/DMS_DocumentUploadController.getDocumentAndAccRecordTypes';
import updateContentVersion from '@salesforce/apex/DMS_DocumentUploadController.updateContentVersion';
import getContentDetails from '@salesforce/apex/DMS_DocumentUploadController.getContentDetails';
import deleteContentDocument from '@salesforce/apex/DMS_DocumentUploadController.deleteContentDocument';
import getDocumentTypes from '@salesforce/apex/DMS_DocumentUploadController.getDocumentTypes';


const columns = [
    {
        label: 'Title', fieldName: 'Title', wrapText: true,
        cellAttributes: {
            iconName: { fieldName: 'icon' }, iconPosition: 'left'
        }
    },
    {
        label: 'Created By', fieldName: 'CREATED_BY',
        cellAttributes: {
            iconName: 'standard:user', iconPosition: 'left'
        }
    },
    { label: 'File Size', fieldName: 'Size' },
    {
        label: 'Preview', type: 'button', typeAttributes: {
            label: 'Preview', name: 'Preview', variant: 'brand-outline',
            iconName: 'utility:preview', iconPosition: 'right'
        }
    },
    {
        label: 'Download', type: 'button', typeAttributes: {
            label: 'Download', name: 'Download', variant: 'brand', iconName: 'action:download',
            iconPosition: 'right'
        }
    },
    {
        label: 'Delete', type: 'button', typeAttributes: {
            label: 'Delete', name: 'Delete', variant: 'destructive', iconName: 'standard:record_delete',
            iconPosition: 'right'
        }
    }
];

const sampleData = [
    {
        Title: 'Sample File 1',
        CREATED_BY: 'John Doe',
        Size: '1.5 MB',
        icon: 'doctype:image'
    }
];



export default class Dms_DocumentUpload extends NavigationMixin(LightningElement) {
     @track pictureOfTheShopdata = [
        { id: 1, label: "Front Right Side" },
        { id: 2, label: "Area Earmarked for Pix" },
        { id: 3, label: "Front left Side" },
        { id: 4, label: "Front Side" },
        { id: 5, label: "Front Entrance Area Pix" },
        { id: 6, label: "Fron Right Corner of Store" },
        { id: 7, label: "Front view of the store" }
    ];
        @track sampleData = sampleData;


    @api recordId;
    documentOptions = [];
    accountTypeOptions = [];

    showModalBox;
    fetchCurrentUploadedRecord;
    @track dataList;
    @track columnsList = columns;

    isLoading = false;
    showFileUpload;
    fileUploadDisable;
    posFileName;


    renderedCallback() {
        Promise.all([
            loadStyle(this, fileSelectorStyles)
        ]);
    }

    connectedCallback() {
        this.getNecessaryDocumentsToUpload();

        getDocumentAndAccRecordTypes()
            .then((result) => {
                if (result && result.accountTypes && result.documentTypes) {
                    const accountTypes = result.accountTypes.split(',');
                    const documentTypes = result.documentTypes.split(',');

                    // this.documentOptions = documentTypes.map(item => ({
                    //     label: item,
                    //     value: item
                    // }));

                    this.accountTypeOptions = accountTypes.map(item => ({
                        label: item,
                        value: item
                    }));
                }
            })
            .catch((error) => {
                //console.error('Error fetching data:', error);
            });

        this.handleSync();
    }


    handleOpenAccordian(event) {
        this.isLoading = true;
        const targetClassList = event.target.classList;
        if (
            targetClassList.contains('slds-accordion__summary') ||
            targetClassList.contains('slds-accordion__summary-content')
        ) {
            const section = event.currentTarget.querySelector('.slds-accordion__section');
            const content = event.currentTarget.querySelector('.slds-accordion__content');
            if (section.classList.contains('slds-is-open')) {
                section.classList.remove('slds-is-open');
                content.style.maxHeight = null; // Reset max height
                this.isLoading = false;
            } else {
                section.classList.add('slds-is-open');
                this.isLoading = false;
                content.style.maxHeight = content.scrollHeight + 'px'; // Set max height to the content's height
            }
        } else {
            this.isLoading = false;
        }
    }

    // document combox change
    handleChange(event) {
        this.documentType = event.detail.value;
        if (this.documentType !== undefined || this.documentType !== '') {
            this.showFileUpload = true;
        }
    }

    get acceptedFormats() {
        return ['.pdf', '.jpg', '.jpeg','.png','.csv'];
    }

    async getNecessaryDocumentsToUpload() {
        await getDocumentTypes({ accountId: this.recordId })
            .then(result => {
                result.forEach((item, index) => {
                    // console.log('item: ' + item);
                    // console.log('index: ' + index);

                    const option = {
                        label: item,
                        value: item
                    };
                    this.documentOptions = [...this.documentOptions, option];
                });
            })
    }


    async handleSync() {
        let imageExtensions = ['png', 'jpg', 'gif'];
        this.isLoading = true;
        await getContentDetails({
            recordId: this.recordId
        })
            .then(result => {
                //alert('handleSync running....');
                //alert('------------'+JSON.stringify(result));
                let parsedData = JSON.parse(result);
                let stringifiedData = JSON.stringify(parsedData);
                let finalData = JSON.parse(stringifiedData);
                let baseUrl = this.getBaseUrl();

                //this.getNecessaryDocumentsToUpload();

                finalData.forEach(file => {
                    file.downloadUrl = baseUrl + 'sfc/servlet.shepherd/document/download/' + file.ContentDocumentId;
                    file.fileUrl = baseUrl + 'sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' + file.Id;
                    file.CREATED_BY = file.ContentDocument.CreatedBy.Name;
                    file.Size = this.formatBytes(file.ContentDocument.ContentSize, 2);

                    let fileType = file.ContentDocument.FileType.toLowerCase();
                    if (imageExtensions.includes(fileType)) {
                        file.icon = 'doctype:image';
                    } else {
                        file.icon = 'doctype:' + fileType;
                    }
                });
                this.dataList = finalData;
                
            })
            .catch(error => {
                this.dataList = undefined;
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    async handleUploadFinished() {
        
        // const data = { docId: '', docType: this?.documentType, docName: '' };
        // const uploadedFiles = event.detail.files;

        // uploadedFiles.forEach(file => {
        //     const documentId = file.documentId;
        //     const documentNm = file.name;
        //     data.docId = documentId;

        //     const myArray = documentNm.split(".");
        //     data.docName = myArray[0];
        // });

        const data = { 
            docId: '', 
            docType: '', 
            docName: '', 
            posDocName: '', 
            cvtitle: '', 
            docLabel: '',
            posLabel: ''
        };

        const uploadedFiles = event.detail.files;

        for (const file of uploadedFiles) {
            const documentId = file.documentId;
            const documentNm = file.name;

            data.docId = documentId;
            const myArray = documentNm.split(".");
            data.docName = myArray[0];
            if (this.documentType !== undefined) {
                data.cvtitle = `${myArray[0]}__${this.documentType}`;
                data.docType = this.documentType;
            } else if (this.posFileName !== undefined) {
                data.cvtitle = `${myArray[0]}__${this.posFileName}`;
                //data.docType = this.posFileName;
            }
        }

        await updateContentVersion({ requestString: JSON.stringify(data) })
            .then((result) => {
                this.documentType = undefined;
                const event = new ShowToastEvent({
                    title: 'Success!',
                    message: 'File Uploaded',
                    variant: 'success'
                });
                this.dispatchEvent(event);
            })
            .catch((error) => {
                const event = new ShowToastEvent({
                    title: 'Error!',
                    message: 'File Not Uploaded Because :' + JSON.stringify(error),
                    variant: 'error'
                });
                this.dispatchEvent(event);
            });
        this.handleSync();
    }

    formatBytes(bytes, decimals) {
        if (bytes == 0) return '0 Bytes';
        var k = 1024,
            dm = decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    handleSearch(event) {
        let value = event.target.value;
        let name = event.target.name;
        if (name === 'Title') {
            this.dataList = this.dataList.filter(file => {
                return file.Title.toLowerCase().includes(value.toLowerCase());
            });
        } else if (name === 'Created By') {
            this.dataList = this.dataList.filter(file => {
                return file.CREATED_BY.toLowerCase().includes(value.toLowerCase());
            });
        }
    }

    getBaseUrl() {
        let baseUrl = 'https://' + location.host + '/';
        return baseUrl;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'Preview':
                this.previewFile(row);
                break;
            case 'Download':
                this.downloadFile(row);
                break;
            case 'Delete':
                this.handleDeleteFiles(row);
                break;
            default:
        }
    }

    previewFile(file) {
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state: {
                selectedRecordId: file.ContentDocumentId
            }
        });
    }

    downloadFile(file) {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: file.downloadUrl
            }
        }, false
        );
    }

    handleDeleteFiles(row) {
        this.isLoading = true;
        deleteContentDocument({
            recordId: row.ContentDocumentId
        })
            .then(result => {
                this.dataList = this.dataList.filter(item => {
                    refreshApex(this.documentOptions);
                    return item.ContentDocumentId !== row.ContentDocumentId;
                });
                //this.getNecessaryDocumentsToUpload();


                const event = new ShowToastEvent({
                    title: 'Success!',
                    message: 'FIle Deleted',
                    variant: 'success'
                });
                this.dispatchEvent(event);
            })
            .catch(error => {
                const event = new ShowToastEvent({
                    title: 'Error',
                    message: 'Errorr ' + JSON.stringify(error),
                    variant: 'error'
                });
                this.dispatchEvent(event);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }  

    handlePosFileUpload(event) {
        this.posFileName = event.currentTarget.dataset.label;
        console.log('-------------file name :' + event.currentTarget.dataset.label);
    }  
}