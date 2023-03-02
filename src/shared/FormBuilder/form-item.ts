export interface FormItem{
    id: any;
    invalid?: boolean;
    required?: boolean;
    type: 'text' | 'textarea' | 'checkbox' | 'image' | 'date' | 'email' | 'number' | 'password' | 'list';
    label: string;
    disabled?: boolean;
    value: any;
    imagePickerType?: 'single' | 'multiple'
    list?: Array<any>
    listDisplayName?: string
    listValueName?: string
}
