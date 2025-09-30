module.exports = function(roles = []){
    return (req,res,next) => {
        const r = (req.user?.role||'user').toLowerCase();
        if(!roles.includes(r)) return res.status(403).json({success:false, message:'권한 부족'});
        next();
    };
};