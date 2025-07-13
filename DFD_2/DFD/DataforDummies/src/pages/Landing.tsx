import Background from "@/components/background";
import Navbar from "@/components/Navbar"
import {Database,TrendingUp,Lightbulb,Zap,ChevronRight,Shield,UserIcon,ArrowBigUpDash,ChartColumnIncreasing,} from "lucide-react"
import { AnimatedButton } from "@/components/Button"

export default function Landing() {
    return (
        <>
            <Background />
            <Navbar />

            
            <header className="relative z-3 flex items-center flex-col pt-10 md:pt-20 px-4 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-7xl mt-8 md:mt-15 bg-gradient-to-r from-white to-[#ae6be8] font-bold text-transparent bg-clip-text uppercase">
                    Datos para todos
                </h1>
                <p className="text-xl sm:text-2xl m-5 md:m-10 bg-[#cfabed] text-transparent bg-clip-text uppercase">
                    Convierte tus datos en soluciones inteligentes
                </p>
            </header>

            <main className="relative z-3 mx-4 sm:mx-8 md:mx-20 overflow-hidden">
                <section className="mb-16">
                    
                    <div className="sr-only">Nuestros servicios</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <article className="flex flex-col items-center py-5 bg-white/4 rounded-xl border border-white/10">
                            <div className="my-5 mt-1 bg-[#3c1c65]/90 rounded-2xl p-5">
                                <Database className="h-6 w-6 md:h-auto md:w-auto" color="white" />
                            </div>
                            <h3 className="text-white font-bold">Análisis de Datos</h3>
                            <p className="inline-block text-white/60 text-center mx-4 md:mx-10 mt-1">
                                Procesa y analiza tus volúmenes de datos de forma sencilla
                            </p>
                        </article>

                        <article className="flex flex-col items-center py-5 bg-white/4 rounded-xl border border-white/10">
                            <div className="my-5 mt-1 bg-[#3c1c65]/90 rounded-2xl p-5">
                                <TrendingUp className="h-6 w-6 md:h-auto md:w-auto" color="white" />
                            </div>
                            <h3 className="text-white font-bold">Visualización</h3>
                            <p className="inline-block text-white/60 text-center mx-4 md:mx-10 mt-1">
                                Crea gráficos interactivos y dashboards profesionales
                            </p>
                        </article>

                        <article className="flex flex-col items-center py-5 bg-white/4 rounded-xl border border-white/10">
                            <div className="my-5 mt-1 bg-[#3c1c65]/90 rounded-2xl p-5">
                                <Lightbulb className="h-6 w-6 md:h-auto md:w-auto" color="white" />
                            </div>
                            <h3 className="text-white font-bold">Insights</h3>
                            <p className="inline-block text-white/60 text-center mx-4 md:mx-10 mt-1">
                                Descubre patrones y tendencias ocultas en tus datos
                            </p>
                        </article>

                        <article className="flex flex-col items-center py-5 bg-white/4 rounded-xl border border-white/10">
                            <div className="my-5 mt-1 bg-[#3c1c65]/90 rounded-2xl p-5">
                                <Zap className="h-6 w-6 md:h-auto md:w-auto" color="white" />
                            </div>
                            <h3 className="text-white font-bold">Automatización</h3>
                            <p className="inline-block text-white/60 text-center mx-4 md:mx-10 mt-1">
                                Automatiza tus análisis y reportes con facilidad
                            </p>
                        </article>
                    </div>
                </section>

                <article className="w-full flex justify-center my-12 md:mt-20">
                    <AnimatedButton
                        variant="default"
                        className="bg-white rounded-3xl text-transparent h-13 w-60 sticky top-0"
                        endIcon={ChevronRight}
                        colorIcon="black"
                    >
                        <span className="bg-gradient-to-r from-[#836c9c] to-[#ae6be8] font-bold text-transparent bg-clip-text text-xl md:text-2xl mb-1">
                            Comienza aquí
                        </span>
                    </AnimatedButton>
                </article>



                <article className="mb-16">
                    <div className="sr-only">Nuestros valores</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <section className="flex flex-col items-center py-5 bg-white/4 rounded-xl border border-white/10">
                            <div className="my-5 mt-1 bg-[#3c1c65]/90 rounded-2xl p-5">
                                <UserIcon className="h-6 w-6 md:h-auto md:w-auto" color="white" />
                            </div>
                            <h4 className="text-white font-bold">Cliente</h4>
                            <span className="inline-block text-white/60 text-center mx-4 md:mx-10 mt-1">
                                Tu satisfacción es nuestra prioridad
                            </span>
                        </section>

                        <section className="flex flex-col items-center py-5 bg-white/4 rounded-xl border border-white/10">
                            <div className="my-5 mt-1 bg-[#3c1c65]/90 rounded-2xl p-5">
                                <Shield className="h-6 w-6 md:h-auto md:w-auto" color="white" />
                            </div>
                            <h4 className="text-white font-bold">Seguridad</h4>
                            <span className="inline-block text-white/60 text-center mx-4 md:mx-10 mt-1">
                                Comprometidos con el cuidado de tus datos
                            </span>
                        </section>

                        <section className="flex flex-col items-center py-5 bg-white/4 rounded-xl border border-white/10">
                            <div className="my-5 mt-1 bg-[#3c1c65]/90 rounded-2xl p-5">
                                <ArrowBigUpDash className="h-6 w-6 md:h-auto md:w-auto" color="white" />
                            </div>
                            <h4 className="text-white font-bold">Crecimiento</h4>
                            <span className="inline-block text-white/60 text-center mx-4 md:mx-10 mt-1">
                                Innovando y creciendo en cada etapa
                            </span>
                        </section>
                    </div>
                </article>
            </main>

            <footer className="mt-16 md:mt-24 px-4 sm:px-8 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-3">
                    <section className="flex flex-col">
                        <div className="flex items-center">
                            <div className="bg-[#3c1c65]/90 rounded-2xl p-3 md:p-5">
                                <ChartColumnIncreasing className="h-6 w-6" color="white" />
                            </div>
                            <h5 className="font-bold text-white ml-3 text-xl md:text-2xl">Data for Dummies</h5>
                        </div>
                        <p className="text-white/60 mt-2 mb-5">Simplificando el análisis de datos para todos</p>
                    </section>

                    <section>
                        <h5 className="font-bold text-white mb-4 text-xl md:text-2xl">Producto</h5>
                        <ul className="text-white/60 text-base md:text-xl flex flex-col gap-3">
                            <li>
                                <a href="#caracteristicas" className="hover:text-white transition-colors">
                                    Características
                                </a>
                            </li>
                            <li>
                                <a href="#precios" className="hover:text-white transition-colors">
                                    Precios
                                </a>
                            </li>
                            <li className="mb-5">
                                <a href="#tutoriales" className="hover:text-white transition-colors">
                                    Tutoriales
                                </a>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h5 className="font-bold text-white mb-4 text-xl md:text-2xl">Compañía</h5>
                        <ul className="text-white/60 text-base md:text-xl flex flex-col gap-3">
                            <li>
                                <a href="#acerca" className="hover:text-white transition-colors">
                                    Acerca de
                                </a>
                            </li>
                            <li>
                                <a href="#blog" className="hover:text-white transition-colors">
                                    Blog
                                </a>
                            </li>
                            <li>
                                <a href="#contacto" className="hover:text-white transition-colors">
                                    Contacto
                                </a>
                            </li>
                        </ul>
                    </section>
                </div>

                <hr className="border-white/10 relative z-10 mx-4 md:mx-35 mt-10" />

                <div className="flex justify-center items-center py-8">
                    <p className="text-white/60 relative z-10 text-center">
                        © 2025 Data for Dummies. Todos los derechos reservados
                    </p>
                </div>
            </footer>
        </>
    )
}

