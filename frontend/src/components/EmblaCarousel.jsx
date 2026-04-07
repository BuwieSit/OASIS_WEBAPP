import React, { useCallback } from 'react'
import {
  PrevButton,
  NextButton,
  usePrevNextButtons
} from './EmblaCarouselArrowButtons'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Subtitle from '../utilities/subtitle'
import { MapPinned } from 'lucide-react'

export function CarouselItem({ thumbnail, hteName = "Name of HTE", hteAddress = "Address of HTE", onClick }) {
    return (
        <>
                {/* PARENT WRAPPER */}
                <div className="embla__slide w-60 h-80 overflow-hidden hover:cursor-pointer" onClick={onClick}>

                {/* IMAGE WRAPPER */}
                <div 
                    className="w-full h-full bg-center bg-cover py-5 flex items-end overflow-hidden rounded-xl" 
                    style={{ 
                        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.0) 60%, transparent 100%), url(${thumbnail})`
                    }}
                >
                    {/* TEXT CONTENT */}
                    <div className='w-full flex flex-col items-start p-3 backdrop-blur-sm bg-white/10 text-white select-none'>
                        <Subtitle text={hteName} weight={"font-bold"} size={"text-[1rem]"} className={"line-clamp-1"}/>

                        <section className='w-full flex flex-row justify-start items-center gap-3'>
                            <MapPinned size={14}/>
                            <Subtitle text={hteAddress} size={"text-[0.7rem]"} className={"line-clamp-1"}/>
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
      {/* TOP CURVE */}
      <div className="absolute top-[-35%] left-1/2 -translate-x-1/2 w-[150vw] h-50 rounded-[100%] pointer-events-none bg-page-white z-30"/>

      {/* BOTTOM CURVE */}
      <div className="absolute bottom-[-25%] left-1/2 -translate-x-1/2 w-[150vw] h-50 rounded-[100%] pointer-events-none bg-page-white z-30"/>

      
      <div className="embla__viewport" ref={emblaRef}>
 
        <div className="embla__container">
          {slides.map((slide, index) => (
            <CarouselItem 
                key={index} 
                thumbnail={slide.thumbnail}
                hteName={slide.hteName}
                hteAddress={slide.hteAddress}
                onClick={() => onSelectHte(slide.id)}  
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
