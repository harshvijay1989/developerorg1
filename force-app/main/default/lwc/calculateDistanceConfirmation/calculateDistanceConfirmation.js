import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import calculateDistancePolicy from '@salesforce/apex/CalculateDistancePolicyController.calculateDistance';
import getAddressDetails from '@salesforce/apex/CalculateDistancePolicyController.getAddressDetails';

export default class CalculateDistanceConfirmation extends LightningElement {
    // Handler for 'Yes' button click
    @api recordId;
    @api calculateDistancee;
    handleYesClick() {
        // Call the Apex class to calculate distance
        calculateDistancePolicy({ leadId: this.recordId })
            .then(result => {
                if (result == 'Not valid distance Approvel Required') {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Account Present within 3 km, Approval Required!!',
                            variant: 'success'
                        })
                    );
                    this.handleCancel();
                } else if (result == 'Success') {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Distance calculation completed successfully.',
                            variant: 'success'
                        })
                    );
                    // Close the component
                    this.handleCancel();
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: result,
                            variant: 'Error'
                        })
                    );
                    // Close the component
                    this.handleCancel();
                }
            })
            .catch(error => {
                console.error('Error calculating distance: ', error);
                // Handle errors here if needed
            });
          
    }

    handleCancel() {
            this.dispatchEvent(new CloseActionScreenEvent());
       window.location.reload();
    }


    @wire(getAddressDetails, { recordId: '$recordId' }) wiredRecord({ error, data }) {
        console.log('DataDataData' + data);

        if (data) {
            this.calculateDistancee = data.HMC_Distance_Calculated__c;
            console.log('data2' + this.calculateDistancee);
        } else if (error) {
        }
    }
}