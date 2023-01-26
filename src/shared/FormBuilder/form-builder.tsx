import {FormItem} from "./form-item";
import {PiButton, PiInput, PiTextArea} from "toll-ui-react";
import {useCallback, useEffect, useState} from "react";

interface Props {
    form: FormItem[];
    onFormSubmit: (value?: any) => void;
    loading: boolean;
}
export  const FormBuilder = (props: Props) => {

    const [forms, setForm] = useState<FormItem[]>(props.form);

    const onSubmitHandler = useCallback((event?: any) => {
        event.preventDefault();
        let errorCount = 0;
        forms.forEach((form) => {
            if (form.required) {
                if (form.value.length === 0) {
                    errorCount ++;
                    form.invalid = true;
                }
            }
        });

        setForm([...forms]);

        if (errorCount === 0) {
            props.onFormSubmit(forms.map((item) => {
                return { [item.id]: item.value }
            }));
        }
    }, [forms, props.form]);

    const formOnChange = useCallback((event: any, type: 'text' | 'textarea' | 'checkbox' | 'image' | 'date' | 'email' | 'number' | 'password', index: number) => {
        if (type === 'text') {
            forms[index].value = event;
        }
        if (type === 'textarea') {
            forms[index].value = event;
        }
        if (type === 'number') {
            forms[index].value = event;
        }
        if (type === 'password') {
            forms[index].value = event;
        }
        if (type === 'email') {
            forms[index].value = event;
        }
        if (type === 'checkbox') {
            forms[index].value = event.target.checked;
        }

        setForm([...forms]);
    }, [forms]);

    return (
        <>
            <div className={'flex flex-col h-full w-full'}>
                <form className={'space-y-3'}>
                    {
                        forms.map((formItem, index) =>
                            <div key={formItem.id}>
                                {
                                    formItem.type === 'text' &&
                                    <PiInput
                                        label={formItem.label}
                                        rounded={'rounded'}
                                        value={formItem.value}
                                        invalid={formItem.invalid}
                                        id={formItem.label}
                                        required={formItem.required}
                                        onChange={(e) => {formOnChange(e, formItem.type, index)}}/>
                                }
                                {
                                    formItem.type === 'textarea' &&
                                    <PiTextArea
                                        label={formItem.label}
                                        rounded={'rounded'}
                                        value={formItem.value}
                                        id={formItem.label}
                                        invalid={formItem.invalid}
                                        required={formItem.required}
                                        onChange={(e) => {formOnChange(e, formItem.type, index)}}/>
                                }
                            </div>
                        )
                    }
                    <PiButton loading={props.loading} rounded={'rounded'} type={'primary'} size={'normal'} onClick={onSubmitHandler}>Submit</PiButton>
                </form>
            </div>
        </>
    )
}