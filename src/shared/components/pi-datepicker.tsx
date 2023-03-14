import {uuid} from "../base.service";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {PiCalendar} from "./pi-calendar";
import {format, isValid, parse} from "date-fns";

interface Props {
    name?: string
    label?: string
    required?: boolean
    placeholder?: string
    onValueChange?: (event: any) => void
    readOnly?: boolean
    invalid?: boolean
    value?: Date
    rounded?: 'rounded' | 'none'
    format?: string
    disablePastDates?: boolean
}
export const PiDatepicker = (props: Props) => {
    const id = uuid()
    const specialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/g
    const [displayLabel, setDisplayLabel] = useState<string>('')
    const [inputEvent, setInputEvent] = useState<any>()
    const [inputSelection, setInputSelection] = useState<number>(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const [inputTouched, setInputTouched] = useState<boolean>(false)
    const [inputIsValid, setInputIsValid] = useState<boolean>(false)
    const defaultClass =
        'bg-gray-50 focus:outline-none text-gray-900 text-sm block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white'
    const inputValidClass =
        'focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 border border-gray-300 dark:border-gray-600'
    const invalidClass =
        'focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500 border border-red-500 dark:border-red-600'
    const [inputIsInValid, setInputIsInValid] = useState<boolean | undefined>(false)
    const [getClick, setClick] = useState<any>()
    const [dateValue, setDateValue] = useState<Date>(new Date())
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
    const selectItem = (item: Date) => {
        setDisplayLabel(format(new Date(item), props.format ?? 'MM/dd/yyyy'))
        props.onValueChange?.(new Date(item))
    }
    const onDisplayModelChange = (event: any) => {
        const newFormat = (props.format ?? 'MM/dd/yyyy' as string).replace('MM', 'DD').replace('dd', 'DD').replace('yyyy', 'DDDD');
        let newStr = formatString(newFormat, event.target.value.replace(specialChars, ''))

        setInputEvent(event)
        setDisplayLabel(newStr)
        setInputSelection(event.target.selectionStart)
        setInputTouched(true)
        if (isValid(new Date(newStr))) {
            setInputIsValid(true)
            setDateValue(parse(newStr, props.format ?? 'MM/dd/yyyy', new Date()))
            props.onValueChange?.(parse(newStr, props.format ?? 'MM/dd/yyyy', new Date()))
        } else {
            setInputIsValid(false)
        }
    }

    const mEnter = useCallback(() => {
        (getClick as HTMLDivElement).classList.remove('date-picker-container');
    }, [getClick])

    const mLeave = useCallback(() => {
        (getClick as HTMLDivElement).classList.add('date-picker-container');
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
        const event = () => {
            if (!document.activeElement?.attributes.getNamedItem('date-picker')) {
                const ele = document.getElementsByClassName('date-picker-container')
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
            const ele = document.getElementsByClassName('date-picker-container')
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
        if (props.value) {
            setDisplayLabel(format(new Date(props.value), props.format ?? 'MM/dd/yyyy'))
            setDateValue(new Date(props.value))
        }
    }, [props.value])

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
                        date-picker='pi-date-picker'
                        placeholder={props.placeholder}
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
                        <i className='pi pi-calendar text-gray-500 text-lg' />
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
                dark:divide-gray-600 date-picker-container overflow-auto shadow-2xl ${id} hidden`}>
                <PiCalendar disablePastDates={props.disablePastDates} date={dateValue} onChange={(e) => selectItem(new Date(e as Date))}/>
            </div>
        </div>
    )
}
