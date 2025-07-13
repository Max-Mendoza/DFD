import { Link } from "react-router"
export default function Navbar() {

    return (


        <nav className="bg-white/0 backdrop-blur-2xl fixed z-10 left-0 right-0 top-0 w-full">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <a  className="flex items-center space-x-3 rtl:space-x-reverse">
                    
                    <span className="self-center text-2xl font-semibold whitespace-nowrap text-white ">Data 4 Dummies</span>
                </a>
                <button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm  rounded-lg md:hidden hover:bg- focus:outline-none focus:ring-2 focus:ring-" aria-controls="navbar-default" aria-expanded="false">
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>
                <div className="hidden w-full md:block md:w-auto" id="navbar-default">
                    <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border- rounded-lg bg- md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 ">
                        <li>
                            <Link to={'/auth/login'} className="block py-2 px-3  rounded-sm md:p-0 text-white cursor">
                                Iniciar Sesion
                            </Link>

                        </li>
                        <li>
                            <Link to={'/auth/signup'} className="block py-2 px-3  rounded-sm md:border-0 md:p-0 text-white cursor z-100">
                                Registrarse
                            </Link>
                        </li>

                    </ul>
                </div>
            </div>
        </nav>

    )
}