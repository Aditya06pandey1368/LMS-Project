import { Button } from '@/components/ui/button'
import { useCreateCheckoutSessionMutation } from '@/Features/api/purchaseApi'
import { Loader2, ShoppingCart } from 'lucide-react'
import React, { useEffect } from 'react'
import { toast } from 'sonner'

const BuyCourseButton = ({ courseId }) => {

    const [createCheckoutSession, {data, isLoading, isSuccess, isError, error}] = useCreateCheckoutSessionMutation();

    const purchaseCourseHandler = async () => {
        await createCheckoutSession(courseId)
    }

    useEffect(()=>{
        if(isSuccess){
            if(isSuccess){
                if(data?.url){
                    window.location.href = data.url; //Redirect to stripe checkout
                }
                else{
                    toast.error("Invalid response from server.")
                }
            }
        }
        if(isError){
            toast.error(error?.data?.message || "Failed to create checkout session");
        }
    },[data,isSuccess,isError,error])
    return (
        <div>
            <Button disabled={isLoading} onClick={purchaseCourseHandler} size="sm" className="flex items-center gap-2 mt-2 sm:mt-0">
                {
                    isLoading ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                            <span>Please wait</span>
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="h-4 w-4" />
                            <span>Purchase Course</span>
                        </>
                    )
                }
            </Button>
        </div>
    )
}

export default BuyCourseButton
