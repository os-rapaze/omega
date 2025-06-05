import Silk from '@/components/Silk/Silk';
import Logo from '@/assets/logo.png'
import AnimatedContent from '@/components/AnimatedContent/AnimatedContent'
import {Button, ButtonGroup} from "@heroui/button";
import { ThemeSwitch } from "@/components/theme-switch";
import { useTheme } from "@heroui/use-theme";
import { useNavigate } from 'react-router-dom';

export default function IndexPage() {
    const navigate = useNavigate();
    
    function goToLoginPage() {
        navigate('/login')
    };
    function goToRegisterPage() {
        navigate('/signup')
    }

    return (
        <div className="flex items-center justify-center" style={{ width: '100%', height: '100vh', position: 'relative' }}>
        
        <ThemeSwitch></ThemeSwitch>
        <div style={{ width: '100%', height: '100vh', position: 'absolute' }}>
        <Silk
        speed={5}
        scale={1}
        color="#101010"
        noiseIntensity={1.5}
        rotation={0}
        />
        </div> 
    <div className="relative w-80 align-center justify-center flex flex-col gap-10 z-10">
                <AnimatedContent
                    distance={-80}
                    direction="vertical"
                    reverse={false}
                    config={{ tension: 80, friction: 20 }}
                    initialOpacity={0.2}
                    animateOpacity
                    scale={1.8}
                    threshold={0.2}

                >
                <div className='flex align-center justify-center'>
                    <img src={Logo} style={{ width: '50%',  }} alt="Logo" />
                </div>
                </AnimatedContent>
                <div className='flex flex-col gap-3'>
                    <Button onPress={goToLoginPage} style={{ width: '100%' }} color="primary" variant="flat">
                        Entrar
                    </Button> 
                <Button onPress={goToRegisterPage} style={{ width: '100%' }} color="default" variant="flat">
                Criar Conta
                </Button>    
                </div>
            </div>
        </div>
    );
}
