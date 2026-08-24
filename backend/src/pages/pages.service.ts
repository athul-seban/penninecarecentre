import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageContent } from './page-content.entity';

const DEFAULT_PAGES = [
  {
    pageKey: 'home',
    title: 'Home',
    metaTitle: 'Pennine Care Centre | Premium Residential Care Glossop',
    metaDescription: 'Pennine Care Centre offers outstanding residential, dementia, and end-of-life care in Glossop, Derbyshire.',
    sections: {
      heroEyebrow: 'Experience Excellence',
      heroHeadline: 'Caring is what we do best',
      heroCta: 'Book a Visit',
      introText: 'Pennine Care Centre provides personalised residential care across two welcoming environments: the mixed-gender Pennine Suite and the male-only Moorland Suite.',
      pennineTitle: 'Pennine Suite',
      pennineDescription: 'With fully secured accommodation and 24 hour support, Pennine Suite caters to a variety of needs. Our person-centred approach ensures that residents are encouraged to live a lifestyle of their choosing.',
      pennineImages: [
        '/assets/images/pennine-suite-exterior.png',
        '/assets/images/pennine-care-drone.png',
        '/assets/images/pennine-suite-lounge.png',
        '/assets/images/pennine-suite-hero.png'
      ],
      moorlandTitle: 'Moorland Suite',
      moorlandDescription: 'Our Moorland Suite is a male-only unit catering to residents with special requirements. Supported by our caring staff, this unique unit provides dignified and quality care.',
      moorlandImages: [
        '/assets/images/pennine-care-entrance.png',
        '/assets/images/community-spaces-lounge.png',
        '/assets/images/moorland-suite-dining.png',
        '/assets/images/moorland-suite-garden-exterior.png'
      ],
      testimonialsSubtitle: 'Read Verified Client Feedback',
      testimonialsTitle: 'What Families Say',
      reviewRating: 'Trusted By Families',
      reviewCount: 'Read verified reviews from residents\' families',
      heroVideoPoster: '/assets/images/pennine-suite-hero.png',
      careDementiaImage: '/assets/images/service-dementia-care.png',
      careMaleOnlyImage: '/assets/images/service-male-only.png',
      careYoungerPeopleImage: '/assets/images/service-younger-people.png',
      careEmotionalPhysicalImage: '/assets/images/service-emotional-physical.png',
      lifeGalleryImage: '/assets/images/life-pennine-gallery.png',
      lifePersonCenteredImage: '/assets/images/life-person-centered-care.png',
      lifeActivitiesImage: '/assets/images/life-activities.png',
      lifeNutritionImage: '/assets/images/life-nutrition-dining.png',
      awardImages: [
        '/assets/images/award-care-association.jpg',
        '/assets/images/award-care-standards.jpg',
        '/assets/images/award-healthcare-excellence.jpg',
        '/assets/images/award-cqc-good.jpg',
      ],
      peaceTitle: 'DELIVERING PEACE OF MIND',
      peaceText: 'Through our person-centred care, we aim to provide each of our residents with the highest possible quality of life, luxurious accommodation, and discreet support.',
      peaceQuote: '"To provide exceptional care, delivered by compassionate people, in the highest quality homes."',
      peaceImage: '',
    },
  },
  {
    pageKey: 'pennine-suite',
    title: 'Pennine Suite',
    metaTitle: 'Pennine Suite | Pennine Care Centre',
    metaDescription: 'The Pennine Suite offers modern, person-centred residential care in Glossop. Private en-suite rooms, beautiful gardens, and 24-hour support.',
    sections: {
      heroSubtitle: 'A Welcoming, Supportive Environment',
      heroTitle: 'Pennine Suite',
      introTitle: 'An Introduction to Tasteful Modernity',
      introText: 'Nestling in the beautiful market town of Glossop, on the edge of the Peak District National Park, Pennine Care is a newly built, purpose-designed residential care home. Our Pennine Suite offers a warm, welcoming environment where residents feel truly at home.',
      introDetailText: 'Thoughtfully designed to blend contemporary comfort with a homely atmosphere, every detail of the Pennine Suite has been crafted with our residents\' wellbeing and dignity in mind.',
      introImages: [
        '/assets/images/pennine-suite-intro.png',
        '/assets/images/pennine-suite-exterior.png',
        '/assets/images/pennine-care-drone.png'
      ],
      communityTitle: 'Our Warm & Caring Community',
      communityText: 'At the heart of the Pennine Suite is a vibrant, caring community where residents are encouraged to live life to the full. Our spacious lounge and dining areas are designed to foster friendship, laughter, and a true sense of belonging.',
      communityQuote: '"A place where every resident is known by name, valued as an individual, and treated with the utmost kindness and respect."',
      communityImages: [
        '/assets/images/pennine-suite-communal-lounge.png',
        '/assets/images/pennine-suite-quality-care.png',
        '/assets/images/pennine-suite-dining.png',
        '/assets/images/pennine-suite-comfort-lounge.jpg',
        '/assets/images/pennine-suite-comfort-lounge-2.png'
      ],
      bedroomsTitle: 'Private, Well-Appointed Bedrooms',
      bedroomsText: 'Each bedroom within the Pennine Suite is a private sanctuary — a space that truly belongs to the resident. Generously proportioned and filled with natural light, our rooms offer a calm and comfortable retreat.',
      bedroomsAmenitiesText: 'Every room features an en-suite wet room, nurse call system, flat-screen television, and individually controlled heating.',
      bedroomImages: [
        '/assets/images/pennine-suite-bedroom.png',
        '/assets/images/pennine-suite-bedroom-2.png',
        '/assets/images/pennine-suite-living-spaces.png'
      ],
      gardensTitle: 'Tranquil Gardens & Outdoors',
      gardensText: 'Our beautifully maintained gardens offer residents the opportunity to enjoy the fresh Peak District air and the restorative power of nature.',
      gardenImages: [
        '/assets/images/pennine-suite-lounge.png',
        '/assets/images/pennine-suite-gardens.png',
        '/assets/images/pennine-suite-outdoor-pathways.png'
      ],
      wellnessTitle: 'Coming Soon — Wellbeing Space',
      wellnessText: 'We are delighted to share that a dedicated Wellbeing Space is currently in development for our Pennine Suite residents.',
      wellnessImage: '',
      galleryImages: [
        '/assets/images/pennine-suite-quality-care.png',
        '/assets/images/pennine-suite-interior.png',
        '/assets/images/pennine-suite-lounge.png',
        '/assets/images/pennine-suite-garden-seating.png',
        '/assets/images/pennine-suite-bedroom.png',
        '/assets/images/pennine-suite-bedroom-2.png',
        '/assets/images/pennine-suite-dining-2.png',
        '/assets/images/pennine-suite-communal-lounge.png',
        '/assets/images/pennine-suite-comfort-lounge-2.png',
        '/assets/images/pennine-suite-outdoor-pathways-2.png'
      ],
    },
  },
  {
    pageKey: 'moorland-suite',
    title: 'Moorland Suite',
    metaTitle: 'Moorland Suite | Pennine Care Centre',
    metaDescription: 'The Moorland Suite is a dedicated male-only residential care unit in Glossop, offering specialist support in a secure, modern environment.',
    sections: {
      heroSubtitle: 'An Elegant Haven for Gentlemen',
      heroTitle: 'Moorland Suite',
      havenTitle: 'An Elegant Haven for Gentlemen',
      havenText: 'The Moorland Suite at Pennine Care has been thoughtfully designed as a dedicated space for gentlemen, offering a refined and supportive environment tailored to their individual needs.',
      havenImages: [
        '/assets/images/community-spaces-lounge.png',
        '/assets/images/moorland-suite-garden.png',
        '/assets/images/pennine-care-entrance.png'
      ],
      spacesTitle: 'Community Spaces',
      spacesText: 'The Moorland Suite\'s communal areas have been designed to encourage connection, conversation, and a real sense of camaraderie.',
      spacesImages: [
        '/assets/images/moorland-suite-community.png',
        '/assets/images/moorland-suite-lounge.png',
        '/assets/images/community-spaces-dining.png'
      ],
      bedroomsTitle: 'Private, Tailored Bedrooms',
      bedroomsText: 'Each bedroom in the Moorland Suite is a private, well-appointed space where residents can relax, recharge, and feel completely at ease.',
      bedroomsAmenitiesText: 'Every room includes a modern en-suite wet room, flat-screen television, nurse call system, and individually controlled heating.',
      bedroomImages: [
        '/assets/images/moorland-suite-bedroom.png',
        '/assets/images/moorland-suite-lounge-2.png',
        '/assets/images/moorland-suite-corridor.png'
      ],
      gardensTitle: 'Secure, Healing Gardens',
      gardensText: 'Our fully enclosed, secure garden spaces offer residents the freedom to enjoy the outdoors with complete peace of mind.',
      gardenImages: [
        '/assets/images/moorland-suite-gardens.png',
        '/assets/images/moorland-suite-patio.png',
        '/assets/images/moorland-suite-outdoor.png'
      ],
      modernisationTitle: 'Coming Soon — Modernisation',
      modernisationText: 'We are excited to announce that an extensive programme of modernisation is planned for the Moorland Suite.',
      modernisationImage: '',
      featureCost: 'Transparent Fees',
      featureCostText: 'We set out our fee structure clearly from the outset, so families have complete clarity from day one.',
      featureTeam: 'Dedicated Team',
      featureTeamText: 'Our carefully selected care team are passionate, highly trained, and committed to making every resident feel valued.',
      galleryImages: [
        '/assets/images/moorland-suite-lounge-2.png',
        '/assets/images/moorland-suite-lounge.png',
        '/assets/images/moorland-suite-corridor.png',
        '/assets/images/moorland-suite-garden.png',
        '/assets/images/moorland-suite-gardens-2.png',
        '/assets/images/moorland-suite-bedroom.png',
        '/assets/images/pennine-suite-dining.png'
      ],
    },
  },
  {
    pageKey: 'services',
    title: 'Our Services',
    metaTitle: 'Care Services | Pennine Care Centre',
    metaDescription: 'Pennine Care Centre provides residential, dementia, male-only, rehabilitation, and end-of-life care services in Glossop, Derbyshire.',
    sections: {
      heroTitle: 'Life & Care Services',
      heroSubtitle: 'Providing dignity, exceptional support, and professional care in Glossop.',
      olderPeopleTitle: 'Older People Care',
      olderPeopleText: 'Our residential care for older people is centred around promoting independence, comfort, and active engagement.',
      olderPeopleDetailText: 'Through personalised care planning, we honour each individual\'s unique life history, ensuring their emotional, physical, and social needs are fully nurtured.',
      olderPeopleImage: '',
      dementiaTitle: 'Dementia Care',
      dementiaText: 'Our Dementia Care offers a very individualistic and person-centred approach. We do all that we can to make the suite as Dementia friendly as possible.',
      dementiaDetailText: 'We have focused activities that provide an opportunity for our residents to enjoy being part of the community as well as a space to find solace in our lounges.',
      dementiaImage: '',
      maleUnitTitle: 'Male Only Unit',
      maleUnitText: 'Our male-only unit offers all the comfort of the Moorland Suite. This suite is dedicated to only male residents, with targeted support, care and activities suited to their needs.',
      maleUnitImage: '',
      rehabilitationTitle: 'Rehabilitation',
      rehabilitationText: 'We work with a range of specialists to create an environment that enables and empowers our residents to rehabilitate to their fullest potential.',
      rehabilitationImage: '',
      endOfLifeTitle: 'End of Life Care',
      endOfLifeText: 'Our End of Life care is committed to providing compassionate, dignified, and peaceful support during life\'s final chapters. We focus deeply on pain management, physical comfort, and emotional solace.',
      endOfLifeImage: '',
    },
  },
  {
    pageKey: 'life-at-pennine',
    title: 'Life at Pennine',
    metaTitle: 'Life at Pennine | Pennine Care Centre',
    metaDescription: 'Discover daily life at Pennine Care Centre — activities, nutrition, person-centred care, family partnerships, and innovative wellbeing.',
    sections: {
      heroTitle: 'Life at Pennine',
      heroSubtitle: 'Nourishing body, mind, and soul through dedicated care and vibrant activities.',
      activitiesTitle: 'In-House Activities',
      activitiesText: 'Our dedicated activity team co-produces with residents and delivers a range of activities to nourish body, mind and soul. We incorporate music, movement, art, pet therapy, sensory play, intergenerational play, outings, and more.',
      activitiesImage: '',
      communityTitle: 'Community Engagement',
      communityText: 'Having a sense of community and belonging is so important to our residents\' wellbeing. Here at Pennine we offer a range of community-focused activities throughout the week.',
      communityImage: '',
      nutritionTitle: 'Nutrition & Hydration',
      nutritionText: 'Creating a balanced, healthy and nutritious menu is important to us, but we also provide meals that meet individual tastes and preferences.',
      nutritionImage: '',
      careTitle: 'Person Centred Care',
      careText: 'All staff at Pennine are trained in person-centred care. We believe that residents are individuals and should be treated as such.',
      careImage: '',
      familyTitle: 'Family Partnerships',
      familyText: 'We actively encourage families to be involved in the life of their loved one. The Care Manager calls families monthly to gain their views and opinions.',
      familyImage: '',
      innovativeTitle: 'Innovative Care',
      innovativeText: 'The use of assistive technology has grown over time. This enables us to deploy a range of technology to increase the level of detection and support in a less intrusive but useful way.',
      innovativeImage: '',
    },
  },
  {
    pageKey: 'team',
    title: 'Our Team',
    metaTitle: 'Our Team & Values | Pennine Care Centre',
    metaDescription: 'Meet the dedicated team behind Pennine Care Centre. Our staff are our greatest asset — passionate, trained, and committed to outstanding care.',
    sections: {
      heroTitle: 'Our Team & Values',
      introTitle: 'Who We Are',
      introText: 'At Pennine Care Centre, our staff are our greatest asset. We are dedicated to creating a rewarding workplace that translates into world-class care for our residents.',
      visionTitle: 'Our Vision',
      visionText: 'We aspire to consistently develop and deliver compassionate person-centred care services, enabling people to live fulfilled lives and create a rewarding workplace for our staff.',
      missionTitle: 'Our Mission',
      missionText: 'To provide caring services with a focus on compassion, empathy, independence, and choice, meeting the individual needs of our residents within a warm, comfortable, homely environment.',
      valuesTitle: 'Our Core Values',
      valuesCaring: 'Caring — The wellbeing of our residents is at the heart of everything we do, treating people with dignity and respect.',
      valuesContinuity: 'Continuity — We strive to provide a quality service through continuous improvement.',
      valuesCollaboration: 'Collaboration — We commit to working in partnership with residents, loved ones, and professionals.',
      valuesCommitment: 'Commitment — We are committed to meeting the bespoke needs of our residents and will behave professionally in the delivery of our services.',
    },
  },
  {
    pageKey: 'contact',
    title: 'Contact',
    metaTitle: 'Contact Us | Pennine Care Centre',
    metaDescription: 'Get in touch with Pennine Care Centre in Glossop. Call us, email, or complete our contact form — we respond within 24 hours.',
    sections: {
      heroPretext: 'We\'d love to hear from you',
      heroTitle: 'Stay Connected',
      contactInfoTitle: 'Reach us through',
      address: 'Pennine Care Centre, Turnlee Road, Glossop, Derbyshire, SK13 6JW',
      phone: '01457 862466',
      email: 'Admin@nyms-services.com',
      formTitle: 'Send us a Message',
      successHeading: 'Message Received!',
      successMessage: 'Thank you for getting in touch. A member of our team will respond within 24 hours.',
    },
  },
  {
    pageKey: 'careers',
    title: 'Careers',
    metaTitle: 'Careers | Pennine Care Centre',
    metaDescription: 'Join our team at Pennine Care Centre in Glossop. We offer career development, competitive pay, and a supportive working environment.',
    sections: {
      heroSubtitle: 'Build a rewarding, purposeful career',
      heroTitle: 'Join Our Family',
      benefitTitle: 'Why Work with Pennine?',
      benefitIntro: 'At Pennine Care Centre, we treat our employees as extended family. We know that top-tier care starts with supported, happy, and fully-empowered team members.',
      benefitGrowth: 'Career Growth',
      benefitGrowthText: 'We fund and support NVQ qualifications, continuous clinical development courses, and offer clear pathways into leadership positions.',
      benefitWellbeing: 'Staff Wellbeing',
      benefitWellbeingText: 'Mental well-being programmes, regular physical assessments, free premium staff meals, and a dedicated cosy break lounge.',
      benefitPay: 'Competitive Pay',
      benefitPayText: 'Highly competitive hourly rates, weekend enhancements, pension match, childcare benefits, and longevity bonus structures.',
      jobsTitle: 'Current Openings',
      jobsIntro: 'Browse our live opportunities in Glossop. Help us deliver dignified care in the Peak District.',
      applyTitle: 'Quick Application',
      applyIntro: 'Complete the secure form below to start your application process with Pennine Care Centre.',
    },
  },
  {
    pageKey: 'faq',
    title: 'Frequently Asked Questions',
    metaTitle: 'Frequently Asked Questions | Pennine Care Centre',
    metaDescription: 'Answers to common questions about visiting, admissions, daily life, and care at Pennine Care Centre in Glossop.',
    sections: {
      heroTitle: 'Frequently Asked Questions',
      heroSubtitle: 'Answers to the questions families ask us most often.',
      visitingQ: 'What are your visiting arrangements?',
      visitingA: 'We welcome visitors and operate a flexible visiting policy so families can stay closely involved in their loved one\'s life. Please contact us to arrange a convenient time to visit.',
      bringQ: 'What should we bring when a loved one moves in?',
      bringA: 'We recommend bringing a small selection of clothing, favourite personal items, and any photographs or keepsakes that will help your loved one feel at home. Our team can provide a full moving-in checklist.',
      bedroomsQ: 'Can bedrooms be personalised?',
      bedroomsA: 'Yes — residents are warmly encouraged to personalise their bedroom with their own furniture, photographs, and cherished belongings, helping the space feel like home.',
      medicationQ: 'How is medication managed?',
      medicationA: 'Our trained care team support residents with medication administration as part of their individual care plan, working closely with GPs and pharmacists.',
      dietaryQ: 'Can you cater for specific dietary requirements?',
      dietaryA: 'Our catering team prepares balanced, nutritious meals tailored to individual tastes, preferences, and any dietary or medical requirements.',
      activitiesQ: 'What activities are available?',
      activitiesA: 'Our activities team runs a varied weekly programme including music, arts and crafts, gentle exercise, and outings, tailored to individual interests and abilities.',
      laundryQ: 'Is laundry included?',
      laundryA: 'Laundry services are included as part of our care package, with residents\' clothing cared for by our housekeeping team.',
      appointmentsQ: 'Can you help with medical appointments?',
      appointmentsA: 'Our team can support residents in attending medical and other appointments — please speak to us about arranging escorted visits.',
      respiteQ: 'Do you offer respite (short-term) stays?',
      respiteA: 'We offer short-term respite stays where availability allows, giving families a trusted break with the reassurance of professional care. Please contact us to check current availability.',
      petsQ: 'Are pets allowed to visit?',
      petsA: 'We understand how much pets can mean to our residents and are happy to discuss visiting pets or other arrangements — please get in touch to talk through your loved one\'s circumstances.',
      smokingQ: 'What are the arrangements for smoking?',
      smokingA: 'For the safety and comfort of all residents and staff, smoking is only permitted in designated outdoor areas. Please ask a member of our team for details.',
      wifiQ: 'Is Wi-Fi and television available?',
      wifiA: 'Wi-Fi and television are available throughout the home, including in communal lounges and bedrooms.',
      admissionsQ: 'How does the admissions process work?',
      admissionsA: 'We guide every family through a clear, step-by-step process from initial enquiry to settling in. Visit our Admissions & Referrals page for full details.',
      feesQ: 'How much does care cost, and how is it funded?',
      feesA: 'Fees vary depending on individual care needs and funding route. Visit our Fees & Funding page for an overview of how care can be funded and what is typically included.',
      concernQ: 'How do I raise a concern?',
      concernA: 'We take all feedback seriously. Please speak to a member of the care team or the Home Manager in the first instance, or contact us using the details on our Contact page. Our full complaints procedure is available on request.',
    },
  },
  {
    pageKey: 'admissions',
    title: 'Admissions & Referrals',
    metaTitle: 'Admissions & Referrals | Pennine Care Centre',
    metaDescription: 'How admissions work at Pennine Care Centre — from initial enquiry through to settling in, step by step.',
    sections: {
      heroTitle: 'Admissions & Referrals',
      heroSubtitle: 'A clear, supportive path from first enquiry to moving in.',
      introText: 'Moving into residential care is a significant decision. We aim to make the process as clear and reassuring as possible, guiding every family and referring professional through each step.',
      step1Title: '1. Initial Enquiry',
      step1Text: 'Contact us by phone, email, or through our website. We\'ll listen to your situation and answer any initial questions about the Pennine Suite or Moorland Suite.',
      step2Title: '2. Discussion with the Family or Professional',
      step2Text: 'We\'ll arrange a conversation with you, your family, or the referring professional (such as a social worker or discharge team) to understand care needs in more detail.',
      step3Title: '3. Pre-Admission Assessment',
      step3Text: 'Our care team carries out a pre-admission assessment to confirm we can safely and appropriately meet the individual\'s needs, in person wherever possible.',
      step4Title: '4. Funding & Fee Confirmation',
      step4Text: 'We confirm the funding route — private, local authority, NHS Continuing Healthcare, or a combination — and provide a clear breakdown of fees. See our Fees & Funding page for more information.',
      step5Title: '5. Visit to the Home',
      step5Text: 'We warmly encourage prospective residents and their families to visit Pennine Care Centre, meet the team, and see the Pennine Suite or Moorland Suite in person before deciding.',
      step6Title: '6. Admission Planning',
      step6Text: 'Once a place is confirmed, we agree a moving-in date and work with you on practical arrangements, including personalising the bedroom and transferring care and medical information.',
      step7Title: '7. Review Following Admission',
      step7Text: 'We review the care plan shortly after admission, and regularly thereafter, to make sure it continues to reflect the resident\'s changing needs and preferences.',
    },
  },
  {
    pageKey: 'fees-funding',
    title: 'Fees & Funding',
    metaTitle: 'Fees & Funding | Pennine Care Centre',
    metaDescription: 'How care is funded at Pennine Care Centre, including private funding, local authority support, and NHS Continuing Healthcare.',
    sections: {
      heroTitle: 'Fees & Funding',
      heroSubtitle: 'Understanding how care at Pennine Care Centre is funded.',
      introText: 'Every resident\'s care needs are different, so fees are based on an individual assessment rather than a single fixed rate. This page explains the main ways care can be funded — please contact us for a personalised quote and full breakdown of costs.',
      privateTitle: 'Private (Self-Funded) Care',
      privateText: 'Residents who fund their own care pay fees directly, agreed in advance based on their individual care plan.',
      localAuthorityTitle: 'Local Authority Funding',
      localAuthorityText: 'Derbyshire County Council may contribute to care costs following a financial and needs assessment. We work with local authority teams throughout this process.',
      nhsChcTitle: 'NHS Continuing Healthcare (CHC)',
      nhsChcText: 'Where an individual has a primary health need, NHS Continuing Healthcare may fund some or all of their care. Eligibility is assessed by the NHS, and our team can support families through this process.',
      topUpTitle: 'Third-Party Top-Ups',
      topUpText: 'Where local authority funding does not cover the full cost of a chosen room or service, a family member or third party may be able to pay a top-up fee, subject to local authority agreement.',
      includedTitle: 'What\'s Typically Included',
      includedText: 'Our standard fees typically include accommodation, meals, personal care, activities, and laundry. We set out exactly what is included in your personalised quote.',
      additionalTitle: 'Services That May Carry an Additional Charge',
      additionalText: 'Certain services — such as hairdressing, chiropody, or particular outings — may carry an additional charge. We\'ll always be clear about any additional costs before they\'re incurred.',
    },
  },
];

@Injectable()
export class PagesService implements OnModuleInit {
  constructor(@InjectRepository(PageContent) private repo: Repository<PageContent>) {}

  async onModuleInit() {
    for (const p of DEFAULT_PAGES) {
      const exists = await this.repo.findOne({ where: { pageKey: p.pageKey } });
      if (!exists) {
        await this.repo.save(this.repo.create(p));
      } else {
        // Merge any missing keys from defaults without overwriting existing values
        const merged = { ...p.sections, ...exists.sections };
        await this.repo.update(exists.id, { sections: merged as Record<string, any> });
      }
    }
  }

  findAll() {
    return this.repo.find({ order: { pageKey: 'ASC' } });
  }

  async findByKey(pageKey: string) {
    const page = await this.repo.findOne({ where: { pageKey } });
    if (!page) throw new NotFoundException(`Page '${pageKey}' not found`);
    return page;
  }

  async update(pageKey: string, data: Partial<PageContent>) {
    const page = await this.findByKey(pageKey);
    await this.repo.update(page.id, data);
    return this.findByKey(pageKey);
  }
}
