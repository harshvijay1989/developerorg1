({
    handleClosePopupLWC: function(component, event, helper) {
        // Handle close event from LWC component
        var popupCmp = component.find('popup');
        $A.util.removeClass(popupCmp, 'slds-fade-in-open');
        $A.util.addClass(popupCmp, 'slds-fade-out-close');
    },
    
    closePopup: function(component, event, helper) {
        // Close the popup
        var popupCmp = component.find('popup');
        $A.util.removeClass(popupCmp, 'slds-fade-in-open');
        $A.util.addClass(popupCmp, 'slds-fade-out-close');
    }
})