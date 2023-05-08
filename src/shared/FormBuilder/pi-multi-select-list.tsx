import React, { useEffect, useRef, useState } from 'react'
import { uuid } from '../base.service'

interface Props {
  name?: string
  label?: string
  required?: boolean
  placeholder?: string
  onValueChange: (event: any) => void
  readOnly?: boolean
  invalid?: boolean
  data: Array<any>
  dataValue: string
  dataLabel: string
  value?: any
  rounded?: 'rounded' | 'none'
}
export const PiMultiSelectList = (props: Props) => {
  const id = uuid()
  const [displayLabel, setDisplayLabel] = useState<string>('')
  const [displayValue, setDisplayValue] = useState<any[]>([])

  const ele = document.getElementById(id)
  const inputRef = useRef<HTMLInputElement>(ele as HTMLInputElement)
  const [inputTouched, setInputTouched] = useState<boolean>(false)
  const [inputIsValid, setInputIsValid] = useState<boolean>(false)
  const defaultClass =
    'bg-gray-50 focus:outline-none text-gray-900 text-sm block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white'
  const inputValidClass =
    'focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 border border-gray-300 dark:border-gray-600'
  const invalidClass =
    'focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500 border border-red-500 dark:border-red-600'
  const [inputIsInValid, setInputIsInValid] = useState<boolean | undefined>(
    false
  )
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const selectItem = (item: any) => {
    const find = props.data.find((u: any) => u === item)
    if (find) {
      const selected = selectedItems.find((u) => u === find[props.dataValue])
      let newLabel = ''
      if (!selected) {
        selectedItems.push(find[props.dataValue])

        setDisplayValue([...selectedItems])
      } else {
        const index = selectedItems.findIndex(
          (u) => u === find[props.dataValue]
        )
        selectedItems.splice(index, 1)
      }
      selectedItems.forEach((u: any) => {
        const findLabel = props.data.find((m) => m[props.dataValue] === u)
        if (findLabel) {
          newLabel = `${
            newLabel
              ? `${newLabel},${findLabel[props.dataLabel]}`
              : findLabel[props.dataLabel]
          }`
        }
      })
      setDisplayLabel(newLabel)
      setSelectedItems([...selectedItems])
      setDisplayValue([...selectedItems])
    }
  }

  const onDisplayModelChange = (event: any) => {
    setDisplayLabel(event.target.value)
    if (event.target.value.length > 0) {
      setInputTouched(true)
    }
    if (event.target.value.length === 0) {
      setInputIsValid(false)
    } else {
      setInputIsValid(true)
    }
  }

  useEffect(() => {
    setInputIsValid(displayValue.length === 0)
    props.onValueChange(displayValue)
  }, [displayValue])

  useEffect(() => {
    setInputIsValid(!displayLabel)
  }, [displayLabel])

  useEffect(() => {
    if (props.value.length > 0) {
      let newLabel = ''
      props.value.forEach((m: any) => {
        const search = props.data.find((u: any) => u[props.dataValue] === m)
        if (search) {
          newLabel = `${
            newLabel
              ? `${newLabel},${search[props.dataLabel]}`
              : search[props.dataLabel]
          }`
        }
      })
      setDisplayLabel(newLabel)
    }
  }, [props.data, props.value, props.dataValue])

  useEffect(() => {
    if (props.value.length > 0) {
      setSelectedItems([...props.value])
    }
  }, [props.value])


  useEffect(() => {
    const event = () => {
      if (
        !document.activeElement?.attributes.getNamedItem('multi-select-list')
      ) {
        const ele = document.getElementsByClassName(
          'multi-select-list-container'
        )
        for (let i = 0; i < ele.length; i++) {
          if (!ele.item(i)?.classList.contains('hidden')) {
            // eslint-disable-next-line no-unused-expressions
            ele.item(i)?.classList.add('hidden')
          }
        }
      }
    }
    window.addEventListener('click', event)

    return () => window.removeEventListener('click', event)
  })

  useEffect(() => {
    const event = () => {
      const ele = document.getElementsByClassName('multi-select-list-container')
      for (let i = 0; i < ele.length; i++) {
        if (!ele.item(i)?.classList.contains('hidden')) {
          // eslint-disable-next-line no-unused-expressions
          ele.item(i)?.classList.add('hidden')
        }
      }

      // eslint-disable-next-line no-unused-expressions
      document.getElementsByClassName(id).item(0)?.classList.remove('hidden')
    }

    const ele = document.getElementById(id)
    if (ele) {
      ele.addEventListener('click', event)
      return () => ele.removeEventListener('click', event)
    } else {
      return () => null
    }
  })


  const checkItem = (item: any): boolean => {
    const display = selectedItems.find((u: any) => u === item)
    return !!display
  }

  useEffect(() => {
    setInputIsInValid(!inputIsValid && inputTouched)
  }, [inputIsValid])

  useEffect(() => {
    setInputIsInValid(props.invalid)
  }, [props.invalid])

  return (
    <div className='relative w-full'>
      {props.label && (
        <label
          htmlFor={id}
          className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
        >
          {props.label}
          {props.required && <span className='text-red-600 text-lg'>*</span>}
        </label>
      )}
      <div className='relative'>
        <input
          multi-select-list='pi-multi-select-list'
          placeholder={props.placeholder}
          readOnly
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
            multi-select-list-container overflow-auto shadow-2xl ${id} hidden`}
      >
        {props.data.length > 0 &&
          props.data.map((item: any) => (
            <div
              onClick={() => selectItem(item)}
              className={`p-2 cursor-pointer dark:hover:bg-gray-600 hover:bg-gray-200 ${
                checkItem(item[props.dataValue])
                  ? 'bg-gray-200 dark:bg-gray-600'
                  : null
              }`}
              key={item[props.dataValue]}
            >
              <span className='text-[14px] leading-[16px] font-[400]'>
                {item[props.dataLabel]}
              </span>
            </div>
          ))}
        {props.data.length === 0 && (
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
