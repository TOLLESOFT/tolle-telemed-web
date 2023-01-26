export interface FormItem{
    id: any;
    invalid?: boolean;
    required?: boolean;
    type: 'text' | 'textarea' | 'checkbox' | 'image' | 'date' | 'email' | 'number' | 'password';
    label: string;
    disabled?: boolean;
    value: any;
}