define([
    'dojo/_base/lang',
    './GenericControlDesigner',
    './HiddenControlDesigner',
    './TextBoxControlDesigner',
    './UrlControlDesigner',
    './PhoneControlDesigner',
    './EmailControlDesigner',
    './CheckBoxControlDesigner',
    './PickListControlDesigner',
    './ComboBoxControlDesigner',
    './UserControlDesigner',
    './OwnerControlDesigner',
    './DateTimePickerControlDesigner',
    './DataGridControlDesigner',
    './NumericControlDesigner',
    './DataSourceDesigner',
    './CurrencyControlDesigner',
    './EditableGridControlDesigner'
], function(
    lang,
    GenericControlDesigner,
    HiddenControlDesigner,
    TextBoxControlDesigner,
    UrlControlDesigner,
    PhoneControlDesigner,
    EmailControlDesigner,
    CheckBoxControlDesigner,
    PickListControlDesigner,
    ComboBoxControlDesigner,
    UserControlDesigner,
    OwnerControlDesigner,
    DateTimePickerControlDesigner,
    DataGridControlDesigner,
    NumericControlDesigner,
    DataSourceDesigner,
    CurrencyControlDesigner,
    EditableGridControlDesigner
) {
    var fromType = {
        'Sage.Platform.QuickForms.Controls.QFTextBox, Sage.Platform.QuickForms': TextBoxControlDesigner,
        'Sage.Platform.QuickForms.QFControls.QFHidden, Sage.Platform.QuickForms.QFControls': HiddenControlDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.QFSLXUrl, Sage.SalesLogix.QuickForms.QFControls': UrlControlDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.QFSLXPhone, Sage.SalesLogix.QuickForms.QFControls': PhoneControlDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.QFSLXEmail, Sage.SalesLogix.QuickForms.QFControls': EmailControlDesigner,
        'Sage.Platform.QuickForms.QFControls.QFCheckBox, Sage.Platform.QuickForms.QFControls': CheckBoxControlDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.QFSLXPickList, Sage.SalesLogix.QuickForms.QFControls': PickListControlDesigner,
        'Sage.Platform.QuickForms.QFControls.QFListBox, Sage.Platform.QuickForms.QFControls': ComboBoxControlDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.QFSLXUser, Sage.SalesLogix.QuickForms.QFControls': UserControlDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.QFSLXOwner, Sage.SalesLogix.QuickForms.QFControls': OwnerControlDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.QFDateTimePicker, Sage.SalesLogix.QuickForms.QFControls': DateTimePickerControlDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.QFDataGrid, Sage.SalesLogix.QuickForms.QFControls': DataGridControlDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.QFSLXNumeric, Sage.SalesLogix.QuickForms.QFControls': NumericControlDesigner,
        'Sage.Platform.QuickForms.QFControls.QFDataSource, Sage.Platform.QuickForms.QFControls': DataSourceDesigner,
        'Sage.Platform.QuickForms.QFControls.QFHqlDataSource, Sage.Platform.QuickForms.QFControls': DataSourceDesigner,
        'Sage.Platform.QuickForms.QFControls.QFMashupDataSource, Sage.Platform.QuickForms.QFControls': DataSourceDesigner,
        'Sage.Platform.QuickForms.QFControls.QFSDataDataSource, Sage.Platform.QuickForms.QFControls': DataSourceDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.QFSLXCurrency, Sage.SalesLogix.QuickForms.QFControls': CurrencyControlDesigner,
        'Sage.SalesLogix.QuickForms.QFControls.SDataGrid.QFSDataGrid, Sage.SalesLogix.QuickForms.QFControls': EditableGridControlDesigner
    };

    var fromDataType = {
        'ccc0f01d-7ba5-408e-8526-a3f942354b3a': TextBoxControlDesigner, /* text */
        'f4ca6023-9f5f-4e41-8571-50ba94e8f233': TextBoxControlDesigner, /* memo */
        '76c537a8-8b08-4b35-84cf-fa95c6c133b0': TextBoxControlDesigner, /* unicode text */
        'b2ed309e-ea89-4eef-8051-6244987953a4': TextBoxControlDesigner, /* unicode memo */
        '47f90249-e4c8-4564-9ae6-e1fa9904f8b8': NumericControlDesigner, /* integer */
        'f37c635c-9fbf-40d8-98d5-750a54a3cca1': NumericControlDesigner, /* number */
        'a6bf2690-3477-4a18-9849-56abf8693934': NumericControlDesigner, /* single */
        '2596d57d-89d6-4b72-9036-b18c64c5324c': NumericControlDesigner, /* decimal */
        '6b0b3d51-0728-4b67-9473-52836a81da53': NumericControlDesigner, /* short */
        '30053f5a-8d40-4db1-b185-1e4128eb26cc': TextBoxControlDesigner, /* standard id */
        '92432b4d-8206-4a96-ba7b-e4cbd374f148': CheckBoxControlDesigner, /* true/false */
        '95ca9d52-6f0b-4a96-bd40-43583f41faf8': CheckBoxControlDesigner, /* yes/no */
        '3edc7c52-e711-431d-b150-969d88ebabf4': CheckBoxControlDesigner, /* boolean */
        '1f08f2eb-87c8-443b-a7c2-a51f590923f5': DateTimePickerControlDesigner, /* date/time */
        '31e8638d-4232-4c61-8827-d94132a33887': EmailControlDesigner, /* email */
        '85f2bba5-1fb7-4ecf-941a-d98d4739c305': PhoneControlDesigner, /* phone */
        'b71918bf-fac1-4b62-9ed5-0b0294bc9900': PickListControlDesigner, /* pick list */
        '17541523-fc31-4269-ac97-df63290d0e31': OwnerControlDesigner, /* owner */
        'a3b52518-801b-44be-96bf-fdca3de84f7f': null, /* lookup */
        '517d5e69-9efa-4d0a-8e7a-1c7691f921ba': null, /* dependency lookup */
        '189a1a4e-396c-4146-95c0-93b5d9e7d160': null, /* char */
        '8edd8fce-2be5-4d3d-bedd-ea667e78a8af': null, /* enum */
        '3ca925e1-4b76-4621-a39c-a0d4cb7327d5': null, /* guid */
        '68e04249-f7e2-4b63-90be-55fbb1f4aa77': null, /* byte */
        '07370ef3-ad24-409f-86a8-ff2db5ee6d69': null, /* binary */
        '5685161e-5f0a-4a36-83fe-89e8e462e9e7': UrlControlDesigner /* url */
    };

    return lang.setObject('Sage.QuickForms.Design.ControlDesignerRegistry', {
        fromType: fromType,
        fromDataType: fromDataType,
        getDesignerFor: function(entry, fallback) {
            var name = entry && entry['$type'];
            return this.fromType[name] || ((fallback !== false) && GenericControlDesigner);
        },
        getDesignerForDataType: function(dataType, fallback) {
            return this.fromDataType[dataType] || ((fallback !== false) && TextBoxControlDesigner);
        }
    });
});