import {Role} from "../../../shared/models/Role";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {HttpProvider} from "../../../store/http-provider";
import {environment} from "../../../shared/environment";
import {finalize, forkJoin, Observable} from "rxjs";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {BaseService} from "../../../shared/base.service";
import {PiCheckbox} from "toll-ui-react";
import {da} from "date-fns/locale";

interface Props {
    data: Role,
    onPermissionsChange?: (value?: any) => void
}
export const UserPermissions = (props: Props) => {
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [loading, setLoading] = useState<boolean>(false);
    const [allChecked, setAllChecked] = useState<boolean>(false);
    const [allMenuChecked, setAllMenuChecked] = useState<boolean>(false);
    const [allSelected, setAllSelected] = useState<any[]>([]);
    const [selectedModule, setSelectedModule] = useState<any>({});
    const [data, setData] = useState<{modules: any[], permissions: any[]}>({modules: [], permissions: []});

    const getModules = () => {
        setLoading(true);
        getEnabled(props.data.id as string)
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
            next: value => {

                value.enabled.data.forEach((m: any) => {
                    m.expand = false;
                    m.checked = false;
                });

                value.enabled.data.forEach((x: any) => {
                    const update = value.permissions.data.find((u: any) => u.moduleId === x.id);

                    if (update) {
                        x.checked = true;
                        x.add = update.add;
                        x.update = update.update;
                        x.delete = update.delete;
                        x.view = update.view;
                        x.print = update.print;

                        x.children.forEach((m: any) => {
                            const child = update.children.find((c: any) => c.menuId === m.id);
                            if (child) {
                                m.checked = true;
                                m.add = child.add;
                                m.update = child.update;
                                m.delete = child.delete;
                                m.view = child.view;
                                m.print = child.print;
                                m.modified = true;
                            } else {
                                m.checked = false;
                                m.modified = false;
                            }
                        });
                    } else{
                        x.checked = false;
                        x.children.forEach((m: any) => {
                            m.checked = false;
                            m.modified = false;
                        });
                    }
                })

                setData(prevState => {
                    return { ...prevState, permissions: [...value.permissions.data], modules: [...value.enabled.data] }
                });
            }
        })
    }
    const selectModules = (value: boolean) => {
        data.modules.forEach(data => {
            data.checked = value;
            data.add = value;
            data.update = value;
            data.delete = value;
            data.view = value;
            data.print = value;
            data.children.forEach((m: any) => {
                m.checked = value;
                m.add = value;
                m.update = value;
                m.delete = value;
                m.view = value;
                m.print = value;
            })
        });
        setData(prevState => {
            return { ...prevState, modules: [...data.modules] }
        });
    }

    const refreshStatus = (item?: any) => {
        const checked = data.modules.every(value => value.checked === true);
        setAllChecked(checked);

        data.modules.forEach((module) => {
            module.checked = !(!module.add && !module.edit && !module.delete && !module.view && !module.print);
            module.children.forEach((child: any) => {
                child.checked = !(!child.add && !child.edit && !child.delete && !child.view && !child.print);
            })
        })

        if (item) {
            setSelectedModule(item);
            if (item.checked) {
                if (!item.add && !item.delete && !item.update && !item.view && !item.print) {
                    item.add = true;
                    item.update = true;
                    item.view = true;
                    item.delete = true;
                    item.print = true;
                }
            } else if (!item.checked) {
                item.add = false;
                item.update = false;
                item.view = false;
                item.delete = false;
                item.print = false;
            }

        }
        setAllSelected([...data.modules.filter(u => u.checked === true)]);

    }

    const getEnabled = (id: string): Observable<{enabled: ApiResponse<any>, permissions: ApiResponse<any>}> => {
        return forkJoin({
            enabled: HttpProvider.get<ApiResponse<any>>('General/GetEnabled', BaseService.HttpHeaders()),
            permissions: HttpProvider.get<ApiResponse<any>>(`General/GetRolePermission/${id}`, BaseService.HttpHeaders())
        })
    }

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });
    }, [context]);

    // update auth value
    useEffect(() => {
        if (auth.accessToken?.token) {
            HttpProvider.apiUrl = environment.apiUrl;
            getModules();
        }
    }, [auth]);

    useEffect(() => {
        refreshStatus();
    }, [data])

    useEffect(() => {
        props.onPermissionsChange?.(allSelected);
    }, [allSelected])

  return (
      <table className={'border-collapse w-full text-sm'}>
          <thead>
          <tr className="noWrap">
              <th className={'border border-slate-600'}></th>
              <th className={'border border-slate-600'}>
                  <div className={'p-2'}>
                      <PiCheckbox onChange={(event) => selectModules(event.target.checked)} value={allChecked} position={"right"} />
                  </div>
              </th>
              <th className={'border border-slate-600'}>ORDER</th>
              <th className={'border border-slate-600'}>ICON</th>
              <th className={'border border-slate-600'}>NAME</th>
              <th className={'border border-slate-600'}>ADD</th>
              <th className={'border border-slate-600'}>EDIT</th>
              <th className={'border border-slate-600'}>DELETE</th>
              <th className={'border border-slate-600'}>VIEW</th>
              <th className={'border border-slate-600'}>PRINT</th>
          </tr>
          </thead>
          <tbody>
          {
              loading &&
              <tr>
                  <td colSpan={9}>
                      <div className={'flex justify-center w-full'}>
                          <h1>loading ...</h1>
                      </div>
                  </td>
              </tr>
          }
          {
              data.modules.length > 0 && !loading &&
              <>
                  {
                      data.modules.map((module) =>
                          <>
                              <tr key={module.id}>
                                  <td className={'border-slate-700 border'}>
                                      {
                                          module.children.length > 0 &&
                                          <div className={'w-full flex justify-center'}>
                                              <i onClick={() => {
                                                  const find = data.modules.find(u => u === module);
                                                  if (find) {
                                                      find.expand = !find.expand;
                                                      setData(prevState => {
                                                          return {...prevState, modules: data.modules}
                                                      })
                                                  }
                                              }} className={`pi ${module.expand ? 'pi-minus-circle' : 'pi-plus-circle'} text-2xl`}></i>
                                          </div>
                                      }
                                  </td>
                                  <td className={'border-slate-700 border'}>
                                      <div className={'p-2'}>
                                          <PiCheckbox onChange={(event) => {
                                              const find =  data.modules.find(u => u === module);
                                              if (find) {
                                                  find.checked = event.target.checked;
                                                  find.add = event.target.checked;
                                                  find.update = event.target.checked;
                                                  find.delete = event.target.checked;
                                                  find.view = event.target.checked;
                                                  find.print = event.target.checked;

                                                  setData(prevState => {
                                                      return { ...prevState, modules: [...data.modules] }
                                                  })
                                              }
                                          }} value={module.checked} />
                                      </div>
                                  </td>
                                  <td className={'border-slate-700 border p-1'}>
                                      {module.order}
                                  </td>
                                  <td className={'border-slate-700 border p-1'}>
                                      <i className={module.icon}></i>
                                  </td>
                                  <td className={'border-slate-700 border p-1'}>
                                      {module.name}
                                  </td>
                                  <td className={'border-slate-700 border p-1'}>
                                      <PiCheckbox onChange={(event) => {
                                          data.modules.find(u => u === module).add = event.target.checked;
                                          setData(prevState => {
                                              return { ...prevState, modules: [...data.modules] }
                                          })
                                      }} value={module.add}/>
                                  </td>
                                  <td className={'border-slate-700 border p-1'}>
                                      <PiCheckbox onChange={(event) => {
                                          data.modules.find(u => u === module).update = event.target.checked;
                                          setData(prevState => {
                                              return { ...prevState, modules: [...data.modules] }
                                          })
                                      }} value={module.update}/>
                                  </td>
                                  <td className={'border-slate-700 border p-1'}>
                                      <PiCheckbox onChange={(event) => {
                                          data.modules.find(u => u === module).delete = event.target.checked;
                                          setData(prevState => {
                                              return { ...prevState, modules: [...data.modules] }
                                          })
                                      }} value={module.delete}/>
                                  </td>
                                  <td className={'border-slate-700 border p-1'}>
                                      <PiCheckbox onChange={(event) => {
                                          data.modules.find(u => u === module).view = event.target.checked;
                                          setData(prevState => {
                                              return { ...prevState, modules: [...data.modules] }
                                          })
                                      }} value={module.view}/>
                                  </td>
                                  <td className={'border-slate-700 border p-1'}>
                                      <PiCheckbox onChange={(event) => {
                                          data.modules.find(u => u === module).print = event.target.checked;
                                          setData(prevState => {
                                              return { ...prevState, modules: [...data.modules] }
                                          })
                                      }} value={module.print}/>
                                  </td>
                              </tr>
                              {
                                  module.expand &&
                                  <tr>
                                      <td colSpan={10} className={'border-slate-700 border'}>

                                          <table className={'border-collapse w-full text-sm'}>
                                              <thead>
                                              <tr className="noWrap">
                                                  <th className={'border border-slate-600'}>
                                                  </th>
                                                  <th className={'border border-slate-600'}>ORDER</th>
                                                  <th className={'border border-slate-600'}>NAME</th>
                                                  <th className={'border border-slate-600'}>ADD</th>
                                                  <th className={'border border-slate-600'}>EDIT</th>
                                                  <th className={'border border-slate-600'}>DELETE</th>
                                                  <th className={'border border-slate-600'}>VIEW</th>
                                                  <th className={'border border-slate-600'}>PRINT</th>
                                              </tr>
                                              </thead>
                                              <tbody>
                                              {
                                                  loading &&
                                                  <tr>
                                                      <td colSpan={9}>
                                                          <div className={'flex justify-center w-full'}>
                                                              <h1>loading ...</h1>
                                                          </div>
                                                      </td>
                                                  </tr>
                                              }
                                              {
                                                  module.children.map((child: any) =>
                                                      <tr key={child.id}>
                                                          <td className={'border-slate-700 border'}>
                                                              <div className={'p-2'}>
                                                                  <PiCheckbox onChange={(event) => {
                                                                      const find = module.children.find((u: any) => u === child);
                                                                      if(find) {
                                                                          find.checked = event.target.checked;
                                                                          find.add = event.target.checked;
                                                                          find.update = event.target.checked;
                                                                          find.delete = event.target.checked;
                                                                          find.view = event.target.checked;
                                                                          find.print = event.target.checked;
                                                                          setData(prevState => {
                                                                              return { ...prevState, modules: [...data.modules] }
                                                                          })
                                                                      }
                                                                  }} value={child.checked} />
                                                              </div>
                                                          </td>
                                                          <td className={'border-slate-700 border p-1'}>
                                                              {child.order}
                                                          </td>
                                                          <td className={'border-slate-700 border p-1'}>
                                                              {child.name}
                                                          </td>
                                                          <td className={'border-slate-700 border p-1'}>
                                                              <PiCheckbox onChange={(event) => {
                                                                  module.children.find((u: any) => u === child).add = event.target.checked;
                                                                  setData(prevState => {
                                                                      return { ...prevState, modules: [...data.modules] }
                                                                  })
                                                              }} value={child.add}/>
                                                          </td>
                                                          <td className={'border-slate-700 border p-1'}>
                                                              <PiCheckbox onChange={(event) => {
                                                                  module.children.find((u: any) => u === child).update = event.target.checked;
                                                                  setData(prevState => {
                                                                      return { ...prevState, modules: [...data.modules] }
                                                                  })
                                                              }} value={child.update}/>
                                                          </td>
                                                          <td className={'border-slate-700 border p-1'}>
                                                              <PiCheckbox onChange={(event) => {
                                                                  module.children.find((u: any) => u === child).delete = event.target.checked;
                                                                  setData(prevState => {
                                                                      return { ...prevState, modules: [...data.modules] }
                                                                  })
                                                              }} value={child.delete}/>
                                                          </td>
                                                          <td className={'border-slate-700 border p-1'}>
                                                              <PiCheckbox onChange={(event) => {
                                                                  module.children.find((u: any) => u === child).view = event.target.checked;
                                                                  setData(prevState => {
                                                                      return { ...prevState, modules: [...data.modules] }
                                                                  })
                                                              }} value={child.view}/>
                                                          </td>
                                                          <td className={'border-slate-700 border p-1'}>
                                                              <PiCheckbox onChange={(event) => {
                                                                  module.children.find((u: any) => u === child).print = event.target.checked;
                                                                  setData(prevState => {
                                                                      return { ...prevState, modules: [...data.modules] }
                                                                  })
                                                              }} value={child.print}/>
                                                          </td>
                                                      </tr>
                                                  )
                                              }
                                              </tbody>
                                          </table>

                                      </td>
                                  </tr>
                              }
                          </>
                      )
                  }
              </>
          }
          </tbody>
      </table>
  )
}
