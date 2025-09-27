import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { auth } from '../_actions/user_action';
import { useNavigate } from 'react-router-dom';


export default function(SpecificComponent, option, adminRoute = null){
    function AuthenticationCheck(props){

        const navigate = useNavigate();
        const dispatch = useDispatch();
        useEffect(()=>{
            dispatch(auth()).then(response=>{
                //console.log(response);

                //로그인 하지 않은 상태 
                if(!response.payload.isAuth){
                    if(option){
                        navigate('/login')
                    }
                }else{
                    //로그인 한 상태
                    if(adminRoute && !response.payload.isAdmin){
                        navigate('/')
                    }else{
                        if(option === false){
                            navigate('/')
                        }
                    }
                }
            })
            .catch((err)=>{
                //console.error('auth error',err);
                //토큰없음/쿠키 미포함/400등 -> 보호 라우트만 로그인으로
                if(option){
                    navigate('/login',{replace:true});
                }
                })//catch구문 추가함
        },[])
        
        return (
            <SpecificComponent {...props}/>//{...props}추가함
        )
        
    }
    return AuthenticationCheck;
}