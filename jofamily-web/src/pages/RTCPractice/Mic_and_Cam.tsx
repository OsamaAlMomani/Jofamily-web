let Stream  = null;

const constraints={
    audio:true,
    video:true
};

const GetUserMedia=async()=>{
    try{
        Stream=await navigator.mediaDevices.getUserMedia(constraints);
        return Stream;
    }   catch (err){
        console.error("Error accessing media devices.", err);
        throw err;
    };
}

export {GetUserMedia};  

