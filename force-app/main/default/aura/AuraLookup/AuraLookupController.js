({
    lookupSearch : function(component, event, helper) {
        // Get the lookup component that fired the search event
        const lookupComponent = event.getSource();
        // Get the SampleLookupController.search server side action
        const serverSearchAction = component.get('c.search');
        // You can pass optional parameters to the search action
        // but you can only use setParam and not setParams to do so
        serverSearchAction.setParam('anOptionalParam', 'not used');
        // Pass the action to the lookup component by calling the search method
        lookupComponent.search(serverSearchAction);
    },
     
    clearErrorsOnChange: function(component, event, helper) {
        const selection = component.get('v.selection');
        const errors = component.get('v.errors');
         
        
        // for optional error handling / clearing in consumer
        var event = component.getEvent('onSelected');
        if (event) {
            event.fire();
        }
        
        if (selection.length && errors.length) {
            component.set('v.errors', []);
        }
    },
    
    clearSelection: function(component, event, helper) {
        component.set('v.selection', []);
        var event = component.getEvent('onSelected');
        if (event) {
            event.fire();
        }
    }
})