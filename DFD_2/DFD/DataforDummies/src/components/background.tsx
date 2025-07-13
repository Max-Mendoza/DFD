import Particles from "./Particles"
export default function Background() {
    return (
        <div className="w-full h-full z-0 fixed ">
            <Particles />
            <div className="w-full h-full z-0 overflow-hidden">
                
            </div>
        </div>
    )
}