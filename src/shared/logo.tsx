
import logo from '../assets/tollesoft.png';
export const Logo = () => {
  return (
      <div className={'space-y-2'}>
          <label className={'text-blue-600 text-6xl block font-light'}>
              tollecare
          </label>
          <h1 className={'font-bold flex justify-end space-x-2'}>
              <span>Powered by</span>
              <img src={logo} className={'w-24 h-[18px]'} alt={'tollesoft.png'}/>
          </h1>
      </div>
  )
}