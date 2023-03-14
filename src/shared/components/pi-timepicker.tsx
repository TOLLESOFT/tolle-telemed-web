import {BaseService, uuid} from "../base.service";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {format, isValid, parse, setHours, setMinutes} from "date-fns";

interface Props {
  name?: string
  label?: string
  required?: boolean
  placeholder?: string
  onValueChange?: (event: any) => void
  invalid?: boolean
  value?: Date
  rounded?: 'rounded' | 'none'
}

export const PiTimepicker = (props: Props) => {
  const id = uuid()
  const specialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/g;
  const [hourList, setHourList] = useState<string[]>([]);
  const [minuteList, setMinuteList] = useState<string[]>([]);
  const [displayLabel, setDisplayLabel] = useState<string>('');
  const [inputEvent, setInputEvent] = useState<any>();
  const [inputSelection, setInputSelection] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputTouched, setInputTouched] = useState<boolean>(false);
  const [inputIsValid, setInputIsValid] = useState<boolean>(false);
  const defaultClass =
      'bg-gray-50 focus:outline-none text-gray-900 text-sm block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white'
  const inputValidClass =
      'focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 border border-gray-300 dark:border-gray-600'
  const invalidClass =
      'focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500 border border-red-500 dark:border-red-600'
  const [inputIsInValid, setInputIsInValid] = useState<boolean | undefined>(false);
  const [getClick, setClick] = useState<any>();
  const [timeValue, setTimeValue] = useState<Date>(new Date());
  const [hour, setHour] = useState<any>();
  const [minute, setMinute] = useState<any>();
  const formatString = (maskFormat: string, stringToFormat: string) => {
    let result = '';
    let strIndex = 0;

    for (let i = 0; i < maskFormat.length; i++) {
      const maskChar = maskFormat[i];
      if (maskChar === 'D') {
        if (stringToFormat[strIndex] && !isNaN(parseInt(stringToFormat[strIndex]))) {
          result += stringToFormat[strIndex];
          strIndex++;
        } else {
          result += '_';
          strIndex++;
        }
      } else if (maskChar === 'A') {
        if (stringToFormat[strIndex] && /^[a-zA-Z]+$/.test(stringToFormat[strIndex])) {
          result += stringToFormat[strIndex];
          strIndex++;
        } else {
          result += '_';
          strIndex++;
        }
      } else {
        result += maskChar;
      }
    }
    return result;
  }
  const selectHour = (item: any) => {
    setHour(item);
  }

  const selectMinutes = (item: any) => {
    setMinute(item);
  }
  const onDisplayModelChange = (event: any) => {
    const newFormat = ('HH:mm' as string).replace('HH', 'DD').replace('mm', 'DD');
    let newStr = formatString(newFormat, event.target.value.replace(specialChars, ''))
    setInputEvent(event)
    setDisplayLabel(newStr)
    props.onValueChange?.(event.target.value)
  }

  const mEnter = useCallback(() => {
    (getClick as HTMLDivElement).classList.remove('time-picker-container');
  }, [getClick])

  const mLeave = useCallback(() => {
    (getClick as HTMLDivElement).classList.add('time-picker-container');
  }, [getClick])

  const dateUpdateEvent = useCallback(() => {

    if (getClick) {
      (getClick as HTMLDivElement).addEventListener('mouseenter', mEnter);

      (getClick as HTMLDivElement).addEventListener('mouseleave', mLeave)

      return () => {
        (getClick as HTMLDivElement).removeEventListener('mouseenter', mEnter);
        (getClick as HTMLDivElement).removeEventListener('mouseleave', mLeave);
      }
    }
  }, [getClick, mEnter, mLeave])

  useEffect(() => {
    const minutes: any[] = [];
    const hours: any[] = [];
    for(let i = 0; i < 60; i++) {
      if (i < 10) {
        minutes.push(`0${i}`)
      } else {
        minutes.push(`${i}`)
      }
    }

    for(let i = 0; i < 24; i++) {
      if (i < 10) {
        hours.push(`0${i}`)
      } else {
        hours.push(`${i}`)
      }
    }

    setHourList([...hours]);
    setMinuteList([...minutes]);
    if(!props.value) {
      props.onValueChange?.(timeValue)
    }
  }, [])

  useEffect(() => {
    if (hour) {
      setTimeValue(setHours(timeValue, hour))
      props.onValueChange?.(setHours(timeValue, hour))
    }
  }, [hour])

  useEffect(() => {
   if (minute) {
     setTimeValue(setMinutes(timeValue, minute))
     props.onValueChange?.(setMinutes(timeValue, minute))
   }
  }, [minute])

  useEffect(() => {
    const event = () => {
      if (!document.activeElement?.attributes.getNamedItem('time-picker')) {
        const ele = document.getElementsByClassName('time-picker-container')
        for (let i = 0; i < ele.length; i++) {
          if (!ele.item(i)?.classList.contains('hidden')) {
            // eslint-disable-next-line no-unused-expressions
            ele.item(i)?.classList.add('hidden')
          }
        }
      }
    }

    document.addEventListener('click', event)

    return () => document.removeEventListener('click', event)
  })

  useEffect(() => {

    const event = () => {
      const ele = document.getElementsByClassName('time-picker-container')
      for (let i = 0; i < ele.length; i++) {
        if (!ele.item(i)?.classList.contains('hidden')) {
          // eslint-disable-next-line no-unused-expressions
          ele.item(i)?.classList.add('hidden');
        }
      }

      // eslint-disable-next-line no-unused-expressions
      document.getElementsByClassName(id).item(0)?.classList.remove('hidden')
    }

    const element = document.getElementById(id)
    if (element) {
      if (!getClick) {
        setClick(document.getElementsByClassName(id).item(0));
      }
      element.addEventListener('click', event)
      return () => element.removeEventListener('click', event)
    } else {
      return () => null
    }
  })

  useEffect(() => {
    dateUpdateEvent();
  }, [getClick])

  useEffect(() => {
    setInputIsInValid(!inputIsValid && inputTouched)
  }, [inputIsValid])

  useEffect(() => {
    setInputIsInValid(props.invalid)
  }, [props.invalid])

  useEffect(() => {
    if (inputEvent) {
      inputEvent.target.setSelectionRange(inputSelection, inputSelection)
    }
  }, [displayLabel])

  useEffect(() => {
    if(props.value) {
      setTimeValue(new Date(props.value))
    }
  }, [props.value])

  useEffect(() => {
    setDisplayLabel(format(timeValue, 'HH:mm'))
  }, [timeValue])

  return (
      <div className={`relative w-full`}>
        {props.label && (
            <label
                htmlFor={id}
                className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
              {props.label}
              {props.required && <span className='text-red-600 text-lg'>*</span>}
            </label>
        )}
        <div className='relative'>
          <div className={'relative w-full'}>
            <input
                time-picker='pi-time-picker'
                placeholder={props.placeholder}
                onChange={onDisplayModelChange}
                value={displayLabel}
                ref={inputRef}
                readOnly={true}
                className={`${defaultClass} ${
                    inputIsInValid
                        ? `${props.required ? invalidClass : inputValidClass}`
                        : inputValidClass
                }
                    ${props.rounded === 'rounded' && 'rounded-lg'}`}
                id={id}
            />
            <div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
              <i className='pi pi-clock text-gray-500 text-lg' />
            </div>
          </div>
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
        <div className={`absolute border mt-2 rounded-[5px] 
                divide-y bg-white dark:bg-gray-700 z-10 block
                dark:border-gray-600 
                dark:divide-gray-600 time-picker-container overflow-auto shadow-2xl ${id} w-32 hidden`}>
          <div className={'grid grid-cols-2 divide-x h-[300px] overflow-auto'}>
            <div className={'flex flex-col justify-center overflow-auto'}>
            <div className={'grow w-full h-full overflow-auto'}>
              {
                hourList.map((hr) => <span key={BaseService.uuid()} onClick={() => selectHour(hr)} className={`block w-full text-center hover:cursor-pointer hover:bg-gray-500 py-1 ${displayLabel.split(':')[0] === hr && 'bg-gray-500'}`}>{hr}</span>)
              }
            </div>
            </div>
            <div className={'flex flex-col justify-center overflow-auto'}>
              <div className={'grow w-full h-full overflow-auto'}>
                {
                  minuteList.map((minute) => <span key={BaseService.uuid()} onClick={() => selectMinutes(minute)} className={`block w-full text-center hover:cursor-pointer hover:bg-gray-500 py-1 ${displayLabel.split(':')[1] === minute && 'bg-gray-500'}`}>{minute}</span>)
                }
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
