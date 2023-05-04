import React, {useEffect, useState} from "react";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {FormObject} from "../../../shared/FormBuilder/form-object";
import {FormInput} from "../../../shared/FormBuilder/form-input";
import {FormTextArea} from "../../../shared/FormBuilder/form-text-area";
import {FormSelect} from "../../../shared/FormBuilder/form-select";
import {FormImage} from "../../../shared/FormBuilder/form-image";
import {FormDate} from "../../../shared/FormBuilder/form-date";
import {FormCheckBox} from "../../../shared/FormBuilder/form-check-box";
import {HttpProvider} from "../../../store/http-provider";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {ScheduleType} from "../../../shared/models/schedule-type";
import {finalize} from "rxjs";
import {Builder} from "../../../shared/FormBuilder/builder";
import {PiButton, PiCheckbox, PiLoader, PiMessage, PiModal} from "toll-ui-react";

interface Props {
  auth: any;
  country: any;
}
export const RegionSetup = (prop: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const messageDialog: MessageProps = {
    open: false,
    message: '',
    type: "success"
  }
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(messageDialog);
  const [regions, setRegions] = useState<any[]>([]);
  const regionForm: FormObject [] = [
    {
      id: 'name',
      type: 'text',
      props: {
        label: 'Name',
        required: true,
        value: ''
      }
    },
    {
      id: 'active',
      type: 'checkbox',
      props: {
        label: 'Active',
        value: false
      }
    }
  ];
  const [form, setForm] = useState<FormObject[]>(regionForm);
  const [formId, setFormId] = useState<string>('');
  const clearDefaultForm = () => {
    setFormId('');
    regionForm.forEach((item) => {
      if (item.type === 'text') {
        (item.props as FormInput).value = ''
      }
      if (item.type === 'textarea') {
        (item.props as FormTextArea).value = ''
      }
      if (item.type === 'select') {
        (item.props as FormSelect).value = ''
      }
      if (item.type === 'image') {
        (item.props as FormImage).image = ''
      }
      if (item.type === 'date') {
        (item.props as FormDate).date = new Date()
      }
      if(item.type === 'checkbox') {
        (item.props as FormCheckBox).value = false
      }
    });
    setForm([...regionForm]);
  }
  const [editState, setEditState] = useState<boolean>(false);

  const openMessageHandler = (options: MessageProps) => {
    setOpenDialog((prevState) => {
      return {...prevState, open: options.open, message: options.message, type: options.type }
    });
  }

  const closeMessageHandler = () => {
    setOpenDialog((prevState) => {
      return {...prevState, open: false }
    });
  }
  const getRegions = () => {
    setLoading(true);
    HttpProvider.get<ApiResponse<Array<any>>>(`General/AllRegions/${prop.country?.id}`, {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${prop.auth?.accessToken?.token}`
    }).pipe(finalize(() => setLoading(false)))
        .subscribe((result) => {
          setRegions([...result.data]);
        })
  }

  const saveHandler = (form: any) => {
    setLoading(true);
    form.countryId = prop.country.id;
    HttpProvider.post<ApiResponse<any>>('General/AddRegion',
        JSON.stringify(form), {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${prop.auth?.accessToken?.token}`
    }).pipe(finalize(() => setLoading(false)))
        .subscribe({
          next: result => {
            if (result.status === 100) {
              getRegions();
              closeModalHandler();
              openMessageHandler({type: "success", message: result.message, open: true});
            } else {
              openMessageHandler({type: "error", message: result.message, open: true});
            }
          }
        })
  }

  const editHandler = (form: any) => {
    setLoading(true);
    form.id = formId;
    form.countryId = prop.country.id;
    HttpProvider.put<ApiResponse<any>>('General/EditRegion',
        JSON.stringify(form), {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${prop.auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
        .subscribe({
          next: result => {
            if (result.status === 100) {
              getRegions();
              closeModalHandler();
              openMessageHandler({type: "success", message: result.message, open: true});
            } else {
              openMessageHandler({type: "error", message: result.message, open: true});
            }
          }
        })
  }

  const editRegionForm = (data: any) => {
    setEditState(true);
    regionForm.forEach((item) => {
      if (item.id === Object.values([item.id])[0])
        if (item.type === 'text') {
          (item.props as FormInput).value = data[item.id];
        }
      if (item.type === 'checkbox') {
        (item.props as FormCheckBox).value = data[item.id];
      }
    });
    setForm([...regionForm]);
    setFormId(data.id);
    setOpenModal(true);
  }

  const closeModalHandler = () => {
    setEditState(false);
    setOpenModal(false);
    clearDefaultForm();
  }

  const submitHandler = (form: any) => {
    if (editState) {
      editHandler(form);
    } else {
      saveHandler(form);
    }
  }

  useEffect(() => {
    if (prop.country?.id) {
      getRegions();
    }
  }, [prop.country?.id])
  return (
      <>
        <PiLoader loading={loading}/>
        {
            openDialog.open &&
            <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
        }
        {
            openModal &&
            <PiModal fullScreen={false} onClose={closeModalHandler}>
              <Builder loading={loading} form={form} onFormSubmit={submitHandler}/>
            </PiModal>
        }
        <div className={'flex flex-col w-full h-full space-y-4'}>
          <div className={'h-auto w-full flex'}>
            <PiButton onClick={() => setOpenModal(true)} type={'primary'} size={'small'} rounded={'rounded'}>
              <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Add Region</span>
            </PiButton>
          </div>
          <div className={'grow w-full h-full overflow-auto'}>
            <h1>{prop.country.name} REGIONS SETUP</h1>
            <table className={'border-collapse w-full text-sm'}>
              <thead>
              <tr className="noWrap">
                <th className={'border border-slate-600'}>NAME</th>
                <th className={'border border-slate-600'}>ACTIVE</th>
                <th className={'border border-slate-600'}></th>
              </tr>
              </thead>
              <tbody>
              {
                  loading &&
                  <tr>
                    <td colSpan={5}>
                      <div className={'flex justify-center w-full'}>
                        <h1>loading ...</h1>
                      </div>
                    </td>
                  </tr>
              }
              {
                  regions.length > 0 && !loading &&
                  <>
                    {
                      regions.map((region) =>
                          <tr key={region.id}>
                            <td className={'border-slate-700 border p-1'}> {region.name}</td>
                            <td className={'border-slate-700 border p-1'}>
                              <PiCheckbox disabled={true} value={region.active}/>
                            </td>
                            <td className={'border-slate-700 border p-1'}>
                              <div className={'flex space-x-2'}>
                                <PiButton onClick={() => editRegionForm(region)} type={'primary'} size={'small'} rounded={'rounded'}>
                                  Edit Region
                                </PiButton>
                              </div>
                            </td>
                          </tr>
                      )
                    }
                  </>
              }
              </tbody>
            </table>
          </div>
        </div>
      </>
  )
}
