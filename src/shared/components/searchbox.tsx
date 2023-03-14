import React, { useEffect, useRef, useState } from 'react'
import 'primeicons/primeicons.css'
import { uuid } from '../base.service'
import {PiButton} from "toll-ui-react";

interface Props {
  name?: string
  label?: string
  required?: boolean
  placeholder?: string
  onValueChange?: (event: any) => void
  readOnly?: boolean
  invalid?: boolean
  allowSearch?: boolean
  value?: any
  rounded?: 'rounded' | 'none'
}
export const SearchBox = (props: Props) => {
  const id = uuid();
  const [locations, setLocations] = useState<Array<any>>([]);
  const [searchable, setSearchable] = useState(false)
  const [displayLabel, setDisplayLabel] = useState<string>('')
  const [displayValue, setDisplayValue] = useState<any>('')
  const [inputEvent, setInputEvent] = useState<any>()
  const [inputSelection, setInputSelection] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputTouched, setInputTouched] = useState<boolean>(false)
  const [inputIsValid, setInputIsValid] = useState<boolean>(false)
  const defaultClass =
    'bg-gray-50 focus:outline-none text-gray-900 text-sm block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white'
  const inputValidClass =
    'focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 border border-gray-300 dark:border-gray-600'
  const invalidClass =
    'focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500 border border-red-500 dark:border-red-600'
  // const [inputClass, setInputClass] = useState(defaultClass)
  const [inputIsInValid, setInputIsInValid] = useState<boolean | undefined>(
    false
  )

  const selectItem = (item: any) => {
    props.onValueChange?.({lat: item.lat, lng: item.long})
  }

  const onDisplayModelChange = (event: any) => {
    setInputEvent(event)
    setDisplayLabel(event.target.value)
    setInputSelection(event.target.selectionStart)
    if (event.target.value.length > 0) {
      setInputTouched(true)
    }
    if (event.target.value.length === 0) {
      setInputIsValid(false)
    } else {
      setInputIsValid(true)
    }
  }

  const checkUndefined = (text: string) => {
    if (text) {
      return `${text},`;
    } else {
      return '';
    }
  }

  const search = () => {
    if (displayLabel.length > 0) {
      getLocationFromNomatim(displayLabel);
      inputRef.current?.focus();
    }
  }

  const getLocationFromNomatim = (search: string) => {
    const nArray: Array<any> = [];
    fetch(`https://nominatim.openstreetmap.org/search?q=${search}&format=geojson&addressdetails=1`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      response.json().then((result) => {
        console.log(result);
        result.features.forEach((s: any, index: number) => {
          nArray.push({
            id: index,
            city: `${checkUndefined(s.properties?.address?.country)} ${checkUndefined(s.properties?.address?.county)} ${checkUndefined(s.properties?.address?.state)}`,
            place: checkUndefined(s.properties?.display_name),
            lat: s.geometry.coordinates[1],
            long: s.geometry.coordinates[0]
          });
        });

        setLocations([...nArray]);
      }).finally(() => {

      })
    })
  }

  useEffect(() => {
    if (inputEvent) {
      inputEvent.target.setSelectionRange(inputSelection, inputSelection)
    }

  }, [displayLabel])

  useEffect(() => {
    setInputIsValid(!displayLabel)
  }, [displayLabel])

  const myEvent = () => {
    const ele = document.getElementsByClassName('search-box-container')
    for (let i = 0; i < ele.length; i++) {
      if (!ele.item(i)?.classList.contains('hidden')) {
        // eslint-disable-next-line no-unused-expressions
        ele.item(i)?.classList.add('hidden')
      }
    }

    // eslint-disable-next-line no-unused-expressions
    document.getElementsByClassName(id).item(0)?.classList.remove('hidden')

    if (!document.activeElement?.attributes.getNamedItem('search-box')) {
      const ele = document.getElementsByClassName('search-box-container')
      for (let i = 0; i < ele.length; i++) {
        if (!ele.item(i)?.classList.contains('hidden')) {
          // eslint-disable-next-line no-unused-expressions
          ele.item(i)?.classList.add('hidden')
        }
      }
    }
  }

  useEffect(() => {
    document.addEventListener('click', myEvent)

    return () => document.removeEventListener('click', myEvent)
  })

  useEffect(() => {
    setInputIsInValid(!inputIsValid && inputTouched)
  }, [inputIsValid])

  useEffect(() => {
    setInputIsInValid(props.invalid)
  }, [props.invalid])

  useEffect(() => {
    setSearchable(!props.allowSearch)
  }, [props.allowSearch])

  useEffect(() => {
    if (locations.length > 0) {
      inputRef.current?.click();
    }
  }, [locations])
  return (
    <div className='relative w-full z-[9]'>
      {props.label && (
        <label
          htmlFor={id}
          className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
        >
          {props.label}
          {props.required && <span className='text-red-600 text-lg'>*</span>}
        </label>
      )}
      <div className='relative flex space-x-2'>
        <div className={'relative w-full'}>
          <input
              search-box='pi-search-box'
              placeholder={props.placeholder}
              readOnly={searchable}
              onChange={onDisplayModelChange}
              value={displayLabel}
              ref={inputRef}
              className={`${defaultClass} ${
                  inputIsInValid
                      ? `${props.required ? invalidClass : inputValidClass}`
                      : inputValidClass
              }
                    ${props.rounded === 'rounded' && 'rounded-lg'}`}
              id={id}
          />
          <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
            <div className='flex flex-col'>
              <i className='pi pi-chevron-up text-gray-500 text-xs' />
              <i className='pi pi-chevron-down text-gray-500 text-xs' />
            </div>
          </div>
        </div>
        <PiButton onClick={search} rounded={'rounded'} type={'primary'} size={'small'}>Search</PiButton>
      </div>
      {inputIsInValid && (
        <div>
          {props.required && (
            <small className='text-red-600'>
              {props.name ?? props.label} is required *
            </small>
          )}
        </div>
      )}
      <div
        className={`absolute border mt-2 rounded-[5px]
            min-w-full divide-y bg-white dark:bg-gray-700 z-10
            dark:border-gray-600
            dark:divide-gray-600
            search-box-container max-h-[200px] overflow-auto shadow-2xl ${id} hidden`}
      >
        {locations.length > 0 &&
            locations.map((item: any, index) => (
            <div
              onClick={() => selectItem(item)}
              className={`p-2 cursor-pointer dark:hover:bg-gray-600 hover:bg-gray-200 ${
                displayValue === item.city &&
                'bg-gray-200 dark:bg-gray-600'
              }`}
              key={index}
            >
              <span className='text-[14px] leading-[16px] font-[400]'>
                {item.city} <br/> <small className={'font-bold'}>{item.place}</small>
              </span>
            </div>
          ))}
        {locations.length === 0 && (
          <div>
            <div className='py-6 cursor-pointer text-center'>
              <span className='text-[14px] leading-[16px] font-[400]'>
                List is empty
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
