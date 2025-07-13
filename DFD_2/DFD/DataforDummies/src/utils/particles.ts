export default class Particles{
    x : number
    y : number
    size : number
    opacity : number
    speedX : number
    speedY : number
    color : string
    position : number

    constructor (x:number ,y:number, size:number, opacity:number, speedX:number, speedY:number, color:string){
        this.x = x
        this.y = y
        this.opacity = opacity
        this.speedX = speedX
        this.speedY = speedY
        this.size = size
        this.color = color
        this.position = Math.sqrt(x^2+y^2)
    }
    update(){
        this.x += this.speedX
        this.y += this.speedY
        
        if ((this.x - this.size< 0 || this.x +this.size> window.innerWidth )){
            this.speedX = -this.speedX
        }
        if ((this.y - this.size < 0 || this.y +this.size > window.innerHeight)){
            this.speedY = -this.speedY
        }
        if (this.position == 0){
            this.x = Math.random() * (200 - 40) +40
            this.y = Math.random() * (200 - 40) +40
        }

        
    }
    draw(ctx: CanvasRenderingContext2D){
        ctx.beginPath();
        ctx.arc(this.x, this.y,this.size, 0, Math.PI*2);
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.fill()
        ctx.closePath()
    }

}