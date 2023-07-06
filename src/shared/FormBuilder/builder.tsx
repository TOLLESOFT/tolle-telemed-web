import {useCallback, useEffect, useState} from "react";
import {PiButton, PiCheckbox, PiImagePicker, PiInput, PiSelectList, PiTextArea} from "toll-ui-react";
import {FormObject} from "./form-object";
import {FormDate} from "./form-date";
import {isValid} from "date-fns";
import {FormInput} from "./form-input";
import {FormTextArea} from "./form-text-area";
import {FormSelect} from "./form-select";
import {FormImage} from "./form-image";
import {FormCheckBox} from "./form-check-box";
import { PiDatepicker } from "../components/pi-datepicker";
import {FormTime} from "./form-time";
import {PiTimepicker} from "../components/pi-timepicker";
import {PiMultiSelectList} from "./pi-multi-select-list";

interface Props {
  form: FormObject[];
  onFormSubmit?: (value?: any) => void;
  loading: boolean;
  title?: string;
}
export const Builder = (props: Props) => {
  const [forms, setForm] = useState<FormObject[]>(props.form);

  const onSubmitHandler = useCallback((event?: any) => {
    if (event) {
      event.preventDefault();
    }
    let errorCount = 0;
    forms.forEach((form) => {
      if (form.props.required) {
        if (form.type === "date"){
          if (!isValid((form.props as FormDate).date)) {
            errorCount ++;
            form.props.invalid = true;
          } 
        }
        if (form.type === "text") {
          const text = (form.props as FormInput);
          if (text.value.length === 0) {
            errorCount ++;
            form.props.invalid = true;
          }
        }

        if (form.type === "textarea") {
          const text = (form.props as FormTextArea);
          if (text.value.length === 0) {
            errorCount ++;
            form.props.invalid = true;
          }
        }

        if (form.type === "select") {
          const text = (form.props as FormSelect);
          if (text.value.length === 0) {
            errorCount ++;
            form.props.invalid = true;
          }
        }

        if (form.type === "image") {
          const text = (form.props as FormImage);
          if (text.image.length === 0) {
            errorCount ++;
            form.props.invalid = true;
          }
        }
      }
    });

    setForm([...forms]);

    if (errorCount === 0) {
      props.onFormSubmit?.(forms.reduce((item: any, currentValue: FormObject) => {
        if (currentValue.type === "date") {
          return {...item, [currentValue.id]: (currentValue.props as FormDate).date};
        }else if (currentValue.type === "time") {
          return {...item, [currentValue.id]: (currentValue.props as FormDate).date};
        }else if (currentValue.type === "text") {
          return {...item, [currentValue.id]: (currentValue.props as FormInput).value};
        }else if (currentValue.type === "textarea") {
          return {...item, [currentValue.id]: (currentValue.props as FormTextArea).value};
        }else if (currentValue.type === "image") {
          return {...item, [currentValue.id]: (currentValue.props as FormImage).image};
        }else if (currentValue.type === "checkbox") {
          return {...item, [currentValue.id]: (currentValue.props as FormCheckBox).value};
        } else {
          return {...item, [currentValue.id]: (currentValue.props as FormSelect).value};
        }
      }, {}));
    }
  }, [forms]);

  const formOnChange = (event: any, type: 'text' | 'textarea' | 'checkbox' | 'image'| 'date' | 'time' | 'select', index: number) => {
    if (type === 'text') {
      (forms[index].props as FormInput).value = event;
    }
    if (type === 'date') {
      (forms[index].props as FormDate).date = new Date(event);
    }
    if (type === 'time') {
      (forms[index].props as FormTime).date = new Date(event);
    }
    if (type === 'textarea') {
      (forms[index].props as FormTextArea).value = event;
    }
    if (type === 'checkbox') {
      (forms[index].props as FormCheckBox).value = event.target.checked;
    }
    setForm([...forms]);
  }

  const getFiles = useCallback((images: Array<any>, index: number) => {
    if (images.length > 0) {
      const image = (forms[index].props as FormImage);
      if (image.type === 'single') {
        image.image = images[0]?.file
      } else {
        image.image = images
      }
      setForm([...forms]);
    }
  }, [forms])

  const selectListValueChange = (event: any, index: number) => {
    (forms[index].props as FormSelect).value = event;
    console.log('select build',event);
    setForm([...forms]);
  }

  useEffect(() => {
    console.log('ff prop', props.form);
    setForm([...props.form])
  }, [props.form])

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
                          label={formItem.props.label}
                          rounded={'rounded'}
                          type={(formItem.props as FormInput).type}
                          value={(formItem.props as FormInput).value}
                          invalid={formItem.props.invalid}
                          id={formItem.props.label as string}
                          required={formItem.props.required}
                          readOnly={formItem.props.disabled}
                          size={"normal"}
                          onChange={(e) => {formOnChange(e, formItem.type, index)}}/>
                  }
                  {
                      formItem.type === 'textarea' &&
                      <PiTextArea
                          label={formItem.props.label}
                          rounded={'rounded'}
                          value={(formItem.props as FormTextArea).value}
                          id={formItem.props.label as string}
                          invalid={formItem.props.invalid}
                          required={formItem.props.required}
                          readOnly={formItem.props.disabled}
                          onChange={(e) => {formOnChange(e, formItem.type, index)}}/>
                  }
                  {
                      formItem.type === 'image' &&
                      <PiImagePicker
                          label={formItem.props.label}
                          onImageAdded={(e) => getFiles(e, index)}
                          type={(formItem.props as FormImage).type as 'single' | 'multiple'}
                          invalid={formItem.props.invalid}
                          required={formItem.props.required}
                          files={(formItem.props as FormImage).image ? [`${(formItem.props as FormImage).image}`] : []}
                          id={formItem.props.label as string} />
                  }
                  {
                      formItem.type === 'select' &&
                      <>
                        {
                          ((formItem.props as FormSelect).type === undefined || (formItem.props as FormSelect).type === 'single') &&
                            <PiSelectList
                                rounded={'rounded'}
                                label={formItem.props.label}
                                onValueChange={(e) => selectListValueChange(e, index)}
                                data={(formItem.props as FormSelect).data ?? []}
                                invalid={formItem.props.invalid}
                                required={formItem.props.required}
                                disabled={formItem.props.disabled}
                                value={(formItem.props as FormSelect).value}
                                dataValue={(formItem.props as FormSelect).dataValue ?? 'id'}
                                dataLabel={(formItem.props as FormSelect).dataName ?? 'name'}/>
                        }
                        {
                            (formItem.props as FormSelect).type === 'multiple' &&
                            <PiMultiSelectList
                                rounded={'rounded'}
                                label={formItem.props.label}
                                onValueChange={(e: any) => selectListValueChange(e, index)}
                                data={(formItem.props as FormSelect).data ?? []}
                                invalid={formItem.props.invalid}
                                required={formItem.props.required}
                                value={(formItem.props as FormSelect).value}
                                dataValue={(formItem.props as FormSelect).dataValue ?? 'id'}
                                dataLabel={(formItem.props as FormSelect).dataName ?? 'name'}/>
                        }
                      </>
                  }
                  {
                      formItem.type === 'date' &&
                      <PiDatepicker
                          label={formItem.props.label}
                          rounded={'rounded'}
                          value={(formItem.props as FormDate).date}
                          invalid={formItem.props.invalid}
                          required={formItem.props.required}
                          readOnly={formItem.props.disabled}
                          disablePastDates={(formItem.props as FormDate).disablePastDates}
                          onValueChange={(e) => {formOnChange(e, formItem.type, index)}}/>
                  }
                  {
                      formItem.type === 'time' &&
                      <PiTimepicker
                          label={formItem.props.label}
                          rounded={'rounded'}
                          value={(formItem.props as FormDate).date}
                          invalid={formItem.props.invalid}
                          required={formItem.props.required}
                          onValueChange={(e) => {formOnChange(e, formItem.type, index)}}/>
                  }
                  {
                    formItem.type === 'checkbox' &&
                      <PiCheckbox
                          label={formItem.props.label}
                          position={"right"}
                          value={(formItem.props as FormCheckBox).value}
                          onChange={(e) => {formOnChange(e, formItem.type, index)}}
                      />
                  }
                </div>
            )
          }
          <PiButton loading={props.loading} rounded={'rounded'} type={'primary'} size={'normal'} onClick={onSubmitHandler}>Submit</PiButton>
        </form>
      </>
  )
}
