
import { div } from "framer-motion/client"
import React, { createContext, use, useState, useContext } from "react"
interface TabProps {
    value: String
    onValueChange: (value: String) => void
}
const context = createContext<TabProps | undefined>(undefined)

interface TabsProps {
    defaultValue: String
    value: String,
    onValueChange: (value: String) => void
    children: React.ReactNode
}
const Tab: React.FC<TabsProps> = ({ defaultValue, value, onValueChange, children }) => {

    return (
        <context.Provider value={{ value, onValueChange }}>
            {children}
        </context.Provider>
    )

}

interface TabsTriggerProps {
    value: String
    children: React.ReactNode
}
const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
    const thisContext = useContext(context)
    if (!thisContext) {
        throw new Error("TabsTrigger must be used within a Tabs component")
    }
    const isActive = thisContext.value === value
    return (
        <div className="flex justify-center items-center" role="group">
            <button 
                className="w-full h-full p-0 cursor-pointer rounded-lg transition duration-300 ease-in-out"
                onClick={() => thisContext.onValueChange(value)}
            >
                <div className="relative inline-block">
                    <h4 className="text-white text-sm relative">
                        {children}
                        {/* Subrayado animado */}
                        <span className={`
                            absolute left-0 -bottom-1 h-0.5 bg-[#9810fa] 
                            transition-all duration-300 ease-in-out
                            ${isActive ? 'w-full font-bold font-[Montserrat]' : 'w-0'}
                        `}></span>
                    </h4>
                </div>
            </button>
        </div>
    )
}

export default function UtilBar() {

    const [selectedSection, setSelectedSection] = useState<String>("Home")
    const sections: Array<String> = ["Inicio", "Transformar", "Modelos", "Visualizar"]
    const handleChangeSection = (value: String) => {
        setSelectedSection(value)
    }
    return (
        <nav className="flex  gap-10 p-1 px-10 h-8" role="toolbar" aria-label="Utility bar" >
            <Tab defaultValue={"Inicio"} value={selectedSection} onValueChange={handleChangeSection} >
                {sections.map((item, index) => (

                    <TabsTrigger value={item}>
                        {item}
                    </TabsTrigger>


                ))
                }
            </Tab>

        </nav>


    )
}