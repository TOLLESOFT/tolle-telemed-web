export class FormInput {
    invalid?: boolean;
    required?: boolean;
    label?: string;
    disabled?: boolean;
    value?: any;
    placeHolder?: string
    type?: 'text' | 'email' | 'number' | 'password'
    mask?: string
}
