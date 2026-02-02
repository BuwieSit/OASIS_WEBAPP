import React, { useCallback } from 'react'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Subtitle from '../utilities/subtitle'
import location from "../assets/icons/location.png"

export function CarouselItem({ thumbnail, hteName = "Name of HTE", hteAddress = "Address of HTE", onClick }) {
    return (
        <>
                {/* PARENT WRAPPER */}
                <div className="embla__slide w-60 h-80 overflow-hidden hover:cursor-pointer" onClick={onClick}>

                    {/* IMAGE WRAPPER */}
                    <div className="w-full h-full bg-center bg-cover py-5 flex items-end" style={{ backgroundImage: `url(${thumbnail || fallbackImg})`}}>
                        <div className='w-full flex flex-col items-start p-3 backdrop-blur-md bg-white/30 shadow-lg text-white'>
                            <Subtitle text={hteName} weight={"font-bold"} size={"text-[1.2rem]"}/>

                            <section className='w-full flex flex-row justify-start items-center gap-3'>
                                <img src={location} className='w-5'/>
                                <Subtitle text={hteAddress} size={"text-[0.7rem]"}/>
                            </section>
                        </div>
                    </div>

                </div>
            
        </>
        
    );
}


const EmblaCarousel = (props) => {
  const { slides, options, onSelectHte } = props
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [Autoplay()])

  const onNavButtonClick = useCallback((emblaApi) => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay) return

    const resetOrStop =
      autoplay.options.stopOnInteraction === false
        ? autoplay.reset
        : autoplay.stop

    resetOrStop()
  }, [])

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  } = usePrevNextButtons(emblaApi, onNavButtonClick)

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((slide, index) => (
            <CarouselItem 
                key={index} 
                thumbnail={slide.thumbnail}
                hteName={slide.hteName}
                hteAddress={slide.hteAddress}
                onClick={() => onSelectHte(slide.hteName)}  
            />
          ))}
        </div>
      </div>

      <div className="embla__controls">
        <div className="embla__buttons">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>
      </div>
    </section>
  )
}

export default EmblaCarousel
