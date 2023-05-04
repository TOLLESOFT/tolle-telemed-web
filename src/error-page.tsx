import no_result from './assets/no-results.png';
import {Logo} from "./shared/logo";

export default function ErrorPage() {
    return (
        <>
            <div className={'h-screen w-screen'}>
                <div className={'flex flex-col w-full h-full overflow-auto'}>
                    <div className={'grid md:grid-cols-1 lg:grid-cols-2 h-full'}>
                        <div className={'col-start-1 col-span-1 bg-slate-100 dark:bg-gray-800/30 h-full'}>
                            <div className={'flex flex-wrap content-center justify-center h-full w-full'}>
                                <div className={'w-5/6 lg:w-4/6 xl:w-3/6 2xl:2/6'}>
                                    <div className={'p-4 justify-center flex'}>
                                        <img src={no_result} className={'w-44'} />
                                    </div>
                                    <h1 className={'text-center text-4xl font-bold'}>Oops!!!</h1>
                                    <p className={'text-center'}>We had an issue completing your request.</p>
                                </div>
                            </div>
                        </div>
                        <div className={'col-auto'}>
                            <div className={'flex flex-wrap content-center justify-center h-full w-full'}>
                                <Logo/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
