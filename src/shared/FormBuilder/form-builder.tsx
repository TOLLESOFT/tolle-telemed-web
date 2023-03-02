
import {PiButton, PiImagePicker, PiInput, PiSelectList, PiTextArea} from "toll-ui-react";
import {useCallback, useState} from "react";
import {FormItem} from "./form-item";

interface Props {
    form: FormItem[];
    onFormSubmit?: (value?: any) => void;
    loading: boolean;
    title?: string;
}
export  const FormBuilder = (props: Props) => {

    const [forms, setForm] = useState<FormItem[]>(props.form);

    const onSubmitHandler = useCallback((event?: any) => {
        if (event) {
            event.preventDefault();
        }
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
            props.onFormSubmit?.(forms.reduce((item, currentValue) => {
                return { ...item, [currentValue.id]: currentValue.value };
            }, {}));
        }
    }, [forms, props.form]);

    const formOnChange = useCallback((event: any, type: 'text' | 'textarea' | 'checkbox' | 'image'| 'date' | 'email' | 'number' | 'password' | 'list', index: number) => {
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

    const getFiles = useCallback((images: Array<any>, form: FormItem, index: number) => {
        if (images.length > 0) {
            console.log(form);
            if (form.imagePickerType === 'single') {
               forms[index].value = images[0]?.file
            } else {
                forms[index].value = images
            }
            setForm([...forms]);
        }
    }, [forms])

    const selectListValueChange = useCallback((event: any, form: FormItem, index: number) => {
        forms[index].value = event;
        setForm([...forms]);
    }, [forms])

    return (
        <>
            <h1>
                {props.title?.toUpperCase()}
            </h1>
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
                                    readOnly={formItem.disabled}
                                    onChange={(e) => {formOnChange(e, formItem.type, index)}}/>
                            }
                            {
                                formItem.type === 'number' &&
                                <PiInput
                                    label={formItem.label}
                                    rounded={'rounded'}
                                    value={formItem.value}
                                    invalid={formItem.invalid}
                                    type={'number'}
                                    id={formItem.label}
                                    required={formItem.required}
                                    readOnly={formItem.disabled}
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
                                    readOnly={formItem.disabled}
                                    onChange={(e) => {formOnChange(e, formItem.type, index)}}/>
                            }
                            {
                                formItem.type === 'image' &&
                                <PiImagePicker
                                    label={formItem.label}
                                    onImageAdded={(e) => getFiles(e, formItem, index)}
                                    // @ts-ignore
                                    type={formItem.imagePickerType}
                                    invalid={formItem.invalid}
                                    required={formItem.required}
                                    readOnly={formItem.disabled}
                                    files={formItem.value ? [`${formItem.value}`] : []}
                                    id={formItem.label} />
                            }
                            {
                                formItem.type === 'list' &&
                                <PiSelectList
                                    rounded={'rounded'}
                                    label={formItem.label}
                                    onValueChange={(e) => selectListValueChange(e, formItem, index)}
                                    data={formItem.list ?? []}
                                    invalid={formItem.invalid}
                                    required={formItem.required}
                                    disabled={formItem.disabled}
                                    value={formItem.value}
                                    dataValue={formItem.listValueName ?? 'id'}
                                    dataLabel={formItem.listDisplayName ?? 'name'}/>
                            }
                        </div>
                    )
                }
                <PiButton loading={props.loading} rounded={'rounded'} type={'primary'} size={'normal'} onClick={onSubmitHandler}>Submit</PiButton>
            </form>
        </>
    )
}
