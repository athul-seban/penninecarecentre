import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageContent } from './page-content.entity';

const DEFAULT_PAGES = [
  {
    pageKey: 'home',
    title: 'Home',
    metaTitle: 'Pennine Care Centre | Premium Residential Care Glossop',
    metaDescription: 'Pennine Care Centre offers outstanding residential, dementia, and end-of-life care in Glossop, Derbyshire. CQC rated Good.',
    sections: {
      heroEyebrow: 'Experience Excellence',
      heroHeadline: 'Caring is what we do best',
      heroCta: 'Book a Visit',
      introText: 'Pennine Care Centre specialises in providing personalised residential care, consisting of the Pennine Suite and Moorland Suite (male only).',
      pennineTitle: 'Pennine Suite',
      pennineDescription: 'With fully secured accommodation and 24 hour support, Pennine Suite caters to a variety of needs. Our person-centred approach ensures that residents are encouraged to live a lifestyle of their choosing.',
      moorlandTitle: 'Moorland Suite',
      moorlandDescription: 'Our Moorland Suite is a male only unit catering to residents with special requirements. Supported by our caring staff, this unique unit provides dignified and quality care.',
      testimonialsSubtitle: 'Read Verified Client Feedback',
      testimonialsTitle: 'Google Reviews',
      reviewRating: '4.8/5',
      reviewCount: 'Based on 48 Google Reviews',
      peaceTitle: 'DELIVERING PEACE OF MIND',
      peaceText: 'Through our person-centred care, we aim to provide each of our residents with the highest possible quality of life, luxurious accommodation, and discreet support.',
      peaceQuote: '"To provide exceptional care, delivered by compassionate people, in the highest quality homes."',
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
      communityTitle: 'Our Warm & Caring Community',
      communityText: 'At the heart of the Pennine Suite is a vibrant, caring community where residents are encouraged to live life to the full. Our spacious lounge and dining areas are designed to foster friendship, laughter, and a true sense of belonging.',
      communityQuote: '"A place where every resident is known by name, valued as an individual, and treated with the utmost kindness and respect."',
      bedroomsTitle: 'Private, Well-Appointed Bedrooms',
      bedroomsText: 'Each bedroom within the Pennine Suite is a private sanctuary — a space that truly belongs to the resident. Generously proportioned and filled with natural light, our rooms offer a calm and comfortable retreat.',
      bedroomsAmenitiesText: 'Every room features an en-suite wet room, nurse call system, flat-screen television, and individually controlled heating.',
      gardensTitle: 'Tranquil Gardens & Outdoors',
      gardensText: 'Our beautifully maintained gardens offer residents the opportunity to enjoy the fresh Peak District air and the restorative power of nature.',
      wellnessTitle: 'Coming Soon — Wellbeing Space',
      wellnessText: 'We are delighted to share that a dedicated Wellbeing Space is currently in development for our Pennine Suite residents.',
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
      spacesTitle: 'Community Spaces',
      spacesText: 'The Moorland Suite\'s communal areas have been designed to encourage connection, conversation, and a real sense of camaraderie.',
      bedroomsTitle: 'Private, Tailored Bedrooms',
      bedroomsText: 'Each bedroom in the Moorland Suite is a private, well-appointed space where residents can relax, recharge, and feel completely at ease.',
      bedroomsAmenitiesText: 'Every room includes a modern en-suite wet room, flat-screen television, nurse call system, and individually controlled heating.',
      gardensTitle: 'Secure, Healing Gardens',
      gardensText: 'Our fully enclosed, secure garden spaces offer residents the freedom to enjoy the outdoors with complete peace of mind.',
      modernisationTitle: 'Coming Soon — Modernisation',
      modernisationText: 'We are excited to announce that an extensive programme of modernisation is planned for the Moorland Suite.',
      featureCost: 'No Hidden Costs',
      featureCostText: 'Our transparent, all-inclusive fee structure means families have complete clarity and peace of mind.',
      featureTeam: 'Dedicated Team',
      featureTeamText: 'Our carefully selected care team are passionate, highly trained, and committed to making every resident feel valued.',
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
      olderPeopleText: 'Our residential and nursing care for older people is centered around promoting independence, comfort, and active engagement.',
      olderPeopleDetailText: 'Through personalised care planning, we honour each individual\'s unique life history, ensuring their emotional, physical, and social needs are fully nurtured.',
      dementiaTitle: 'Dementia Care',
      dementiaText: 'Our Dementia Care offers a very individualistic and person-centred approach. We do all that we can to make the suite as Dementia friendly as possible.',
      dementiaDetailText: 'We have focused activities that provide an opportunity for our residents to enjoy being part of the community as well as a space to find solace in our lounges.',
      maleUnitTitle: 'Male Only Unit',
      maleUnitText: 'Our male only unit offers all the comfort of the Moorland Suite. This suite is dedicated to only male residents with targeted support, care and activities suited for male residents.',
      rehabilitationTitle: 'Rehabilitation',
      rehabilitationText: 'We work with a range of specialists to create an environment that enables and empowers our residents to rehabilitate to their fullest potential.',
      endOfLifeTitle: 'End of Life Care',
      endOfLifeText: 'Our End of Life care is committed to providing compassionate, dignified, and peaceful support during life\'s final chapters. We focus deeply on pain management, physical comfort, and emotional solace.',
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
      activitiesText: 'Our dedicated activity team co-produce with residents and deliver a range of activities to nourish body, mind and soul. We incorporate music, movement, art, pet therapy, sensory play, intergenerational play, outings, and more.',
      communityTitle: 'Community Engagement',
      communityText: 'Having a sense of community and belonging is so important to our residents\' wellbeing. Here at Pennine we offer a range of community focused activities throughout the week.',
      nutritionTitle: 'Nutrition & Hydration',
      nutritionText: 'Creating a balanced, healthy and nutritious menu is important to us, but we also provide meals that meet individual tastes and preferences.',
      careTitle: 'Person Centred Care',
      careText: 'All staff at Pennine are trained in person-centred care. We believe that residents are individuals and should be treated as such.',
      familyTitle: 'Family Partnerships',
      familyText: 'We actively encourage families to be involved in the life of their loved one. The Care Manager calls families monthly to gain their views and opinions.',
      innovativeTitle: 'Innovative Care',
      innovativeText: 'The use of assistive technology has grown over time. This enables us to deploy a range of technology to increase the level of detection and support in a less intrusive but useful way.',
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
      benefitWellbeingText: 'Mental well-being programs, regular physical assessments, free premium staff meals, and a dedicated cosy break lounge.',
      benefitPay: 'Competitive Pay',
      benefitPayText: 'Highly competitive hourly rates, weekend enhancements, pension match, childcare benefits, and longevity bonus structures.',
      jobsTitle: 'Current Openings',
      jobsIntro: 'Browse our live opportunities in Glossop. Help us deliver dignified care in the Peak District.',
      applyTitle: 'Quick Application',
      applyIntro: 'Complete the secure form below to start your application process with Pennine Care Centre.',
    },
  },
];

@Injectable()
export class PagesService implements OnModuleInit {
  constructor(@InjectRepository(PageContent) private repo: Repository<PageContent>) {}

  async onModuleInit() {
    for (const p of DEFAULT_PAGES) {
      const exists = await this.repo.findOne({ where: { pageKey: p.pageKey } });
      if (!exists) await this.repo.save(this.repo.create(p));
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
