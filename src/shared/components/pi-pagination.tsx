import {PiIconButton, PiSelectList} from "toll-ui-react";
import {useEffect, useState} from "react";
import {Paging} from "../models/paging";

interface Props {
    pageSize: number;
    pageNumber: number;
    totalPages: number;
    totalRecords: number;
    currentSize: number;
    pageSizeChangeHandler: (pageSize: number) => void;
    pageNumberChangeHandler: (pageNumber: number) => void;
}
export const PiPagination = (props: Props) => {
    const [paging, setPaging] = useState<Paging>({ pageSize: 10, pageNumber: 1, totalPages: 0, totalRecords: 0, currentSize: 0 });
    const nextPage = () => {
        if (paging.totalPages > paging.pageNumber) {
            const num = paging.pageNumber + 1;
            setPaging(prevState => {
                return {...prevState, pageNumber: num}
            });
            props.pageNumberChangeHandler(num)
        }
    }

    const previousPage = () => {
        if (paging.pageNumber > 1) {
            const num = paging.pageNumber - 1;
            setPaging(prevState => {
                return {...prevState, pageNumber: num }
            });
            props.pageNumberChangeHandler(num)
        }
    }

    const sizeChange = (value: number) => {
        setPaging(prevState => {
            return {...prevState, pageSize: value}
        });
        props.pageSizeChangeHandler(value);
    }

    const defaultPageSizes: Array<{value: any}> = [{value: 10}, {value: 20}, {value: 30 }, {value: 50}, {value: 100}];

    useEffect(() => {
        setPaging(prevState => {
            return {...prevState, pageSize: props.pageSize, pageNumber: props.pageNumber, totalPages: props.totalPages, totalRecords: props.totalRecords, currentSize: props.currentSize}
        })
    }, [props])

    return (
        <div className={'space-x-4 flex items-center'}>
            <PiIconButton type={'primary'} size={'small'} rounded={'rounded'} onClick={previousPage} icon={'pi pi-arrow-left'}/>
            <PiIconButton type={'primary'} size={'small'} rounded={'rounded'} onClick={nextPage} icon={'pi pi-arrow-right'}/>
            <PiSelectList value={paging.pageSize} rounded={'rounded'} onValueChange={sizeChange} data={defaultPageSizes} dataValue={'value'} dataLabel={'value'}/>
            <label className={'block min-w-max text-[15px]'}>page {paging.pageNumber} of {paging.totalPages} | Total: {paging.totalRecords}</label>
        </div>
    )
}
