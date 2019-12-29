const User=require('../models/user');
const fs=require('fs');
const path=require('path');
const Message=require('../models/message');
const ResetPassword=require('../models/resetpassword');
const crpto=require('crypto');
const resetMailer=require('../mailers/resetpassword');

// let's keep it same as before
module.exports.profile = function(req, res){
    User.findById(req.params.id, function(err, user){
        return res.render('user_profile', {
            title: 'User Profile',
            profile_user: user
        });
    });

}

module.exports.search= async function(req,res)
{ try{ 
       let user=await User.findOne({email:req.body.email});

       if(user)
       {
        console.log('user is ',user);

        return res.render('user_profile', {
            title: 'User Profile',
            profile_user: user
        });
    }else{
        req.flash('error','user not found');
        return res.redirect('/');
    }
        

     }catch(err)
     {
         
         return res.redirect('back');
     }
}


// controller to update password

module.exports.resetPasswordMail=async function(req,res)
{
    try{
        // find user by mail
        let user=await User.findOne({email:req.body.email});

        // crating resetpassword model details
        console.log('user found ',user);

    let resetDb= await ResetPassword.create(
            {
                user:user.id,
                key:crpto.randomBytes(20).toString('hex'),
                isvalid:true

            }
        );
    
        resetMailer.resetPassword(resetDb,user);
        req.flash('success','Reset link is send to Your Email');

        return res.redirect('back');
    }catch(err)
    {
        console.log('error in processing reset request',err);
        return res.redirect('back');
    }
}




module.exports.resetPasswodUpdatePage= async function(req,res)
{ 
    // find resetpassword db and make isvalid false 
try{  console.log('id  ',req.query.id);
    let resetuserdb=await ResetPassword.findOne({key:req.query.id});
   console.log('reset user db id',resetuserdb);

   if(resetuserdb.isvalid==true)
   {
        resetuserdb.isvalid=false;
        resetuserdb.save();
        console.log(resetuserdb.isvalid);

        return res.render('updatepassword',
        {
            title:'update password'
        });
    }
    else{
        req.flash('error','You link is expired routing you to homepage');
        res.render('signin',
        {
            title:"sign in"
        });
    }

}catch(err)
    {
        console.log('error in loading update page',err);
        return res.redirect('back');
    }

}

// controller to reset password

module.exports.resetPassword=async function(req,res)
{
    // find user by email

    if(req.body.password!=req.body.confirm_password)
    {
        return res.redirect('back');
    }

     let user =await User.findOne({email:req.body.email});

         user.password=req.body.password;
         user.save();
         req.flesh('success','Your password is changed successfully')
         return  res.render('signin',
         {
             title:"sign in"
         });
}

module.exports.freindprofile=async function(req,res)
{   try
    {
      let user=await User.findOne({name:req.query.type});

      // finding the messages of the user from db
      let messages=await Message.findOne({id:req.query.id});
      return res.render('freinds',{
           title:'User Profile',
           profile_user:user,
           id:req.query.id,
           msgs:messages
      });
    }catch(err)
    {
        console.log('error in finding profile',err);
        return res.redirect('back');
    }


}

module.exports.update= async function(req,res)
{
    if(req.user.id == req.params.id){
       
       try{

         let user= await   User.findById(req.params.id);

         User.uploadedAvatar(req,res,function(err)
         {
             if(err){console.log("****Error in multer**",err);return;}

             user.name=req.body.name;
             user.email=req.body.email;

             if(req.file)
             {   // if user want to change old profile pic
                 if(user.avatar)
                 {
                      fs.unlinkSync(path.join(__dirname,'..',user.avatar));
                 }
                
                // saving the ulodeded file path to avtar filed in user schema
                 user.avatar=User.avatarpath + '/' +req.file.filename;
             }

             user.save();
             return res.redirect('back');
         });
                
           
        }catch(err)
        {
            req.flash("error",err);
            res.redirect('back');
        }



    }else{
        req.flash('error', 'Unauthorized!');
        return res.status(401).send('Unauthorized');
    }
}


module.exports.signin=function(req,res)
{ if(req.isAuthenticated())  return res.redirect('back');
    res.render('signin',
    {
        title:"sign in"
    });
}

module.exports.signup=async function(req,res)
{ 
    if (req.isAuthenticated()){
        return res.redirect('/');
    }


    return res.render('signup', {
        title: "Sign Up"
    });

}

module.exports.resetpasswordpage=function(req,res)
{
    return res.render('resetpasswordpage',
    {
        title:'Reset Password'
    });
}

module.exports.post=function(req,res)
{
    res.render('post',{title:"post"});
}

// get the sign up data
module.exports.create = async function(req, res){
   try{

    if (req.body.password != req.body.confirm_password){
        return res.redirect('back');
    }

  let user=  await User.findOne({email: req.body.email});

        if (!user){
           let newuser= await User.create(req.body);

                return res.redirect('/user/signin');
            }
        else{
            return res.redirect('back');
        }
    }catch(err)
    {
        console.log('ERror');
        return;
    }
    
}

module.exports.createsession = function(req,res)
{  req.flash('success','Logged in Successfully');
    return res.redirect('/');
}

module.exports.signout=function(req,res)
{  req.flash('success','You are Logged Out');
    req.logout();
    return res.redirect('/');
}




