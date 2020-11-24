import React, { useContext, useState} from 'react';
import ReactGA from 'react-ga';
import axios from 'axios';
import cookie from 'react-cookies';
import { Layout } from 'antd';

import Header from './components/header';
import Hero from './components/hero';
import Footer from './components/footer';
import Settings from './components/settings';
import Ipsum from './components/ipsum';
import CookieBanner from './components/cookie-banner';
import { useCookies } from './CookieContext';
import './app.scss';

import {initialSettings} from './data';

const { Content } = Layout;

export default function AppInner(props) {
  const cookieConsent  = useCookies();
  console.log('meow', cookieConsent);

  const [settings, setSettings] = useState(initialSettings);
  const [ipsum, setIpsum] = useState(null);
  const [ipsumCopied, setIpsumCopied] = useState(false);

  const [displayCookieBanner, setDisplayCookieBanner] = useState(cookieConsent !== undefined ? false: true);
  const [displayCookieExplanation, setDisplayCookieExplanation] = useState(false);

  const setCookies = () => {
    if (cookieConsent) {
      const savedSettings = JSON.stringify(settings);
      cookie.save('smashipsum__settings', savedSettings, { path: '/' });
    }
  };

  const getData = () => {
    const params = {
      numParagraphs:  settings.numParagraphs,
      minWords:       settings.minWords,
      maxWords:       settings.maxWords,
      minSentences:   settings.minSentences,
      maxSentences:   settings.maxSentences,
      format:         settings.format,
      smash64:        settings.smash64,
      melee:          settings.melee,
      brawl:          settings.brawl,
      pm:             settings.pm,
      smash4:         settings.smash4,
      ultimate:       settings.ultimate
    };

    axios.get('/api/ipsum', {
      params: params
    })
    .then(res => {
      let { ipsum } = res.data;

      setIpsum(ipsum);
      setIpsumCopied(false);

      if (cookieConsent) {
        ReactGA.event({
          category: 'Ipsum',
          action: 'Generate Text'
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
  };

  const onCheckboxCheck = (e) => {
    let { instance, name, checked } = e.target;

    const newSettings = {
      ...settings,
      [instance]: {
        ...settings[instance],
        [name]: checked,
      },
    };

    setSettings(newSettings);
    setCookies();
  }

  const onSelectChange = (name) => (value) => {
    const newSettings = {
      ...settings,
      [name]: value,
    };

    setSettings(newSettings);
    setCookies();
  }

  const onNumberChange = (name) => (value) => {
    const newSettings = {
      ...settings,
      [name]: value,
    };

    setSettings(newSettings);
    setCookies();
  }

  const onCookieBannerSelection = () => {
    setDisplayCookieBanner(false);
    setDisplayCookieExplanation(false);
  };

  const onCookieExplanation = (e) => {
    e.preventDefault();

    setDisplayCookieExplanation(true);
  };

  const onAnchorScroll = field => (e) => {
    e.preventDefault();

    document.getElementById(field).scrollIntoView({behavior:"smooth", block: "start"});
  }

  const copyData = (e) => {
    e.preventDefault();

    navigator.clipboard.writeText(ipsum);
    setIpsumCopied(true);
  };

  // componentDidMount() {
  //   const cookieConsent = cookie.load('smashipsum__cookie-consent');
  //   const settingsCookieValue = cookie.load('smashipsum__settings');
  //   const darkModeCookieValue = cookie.load('smashipsum__darkmode');
  //
  //   if (cookieConsent === 'true' && (settingsCookieValue || darkModeCookieValue)) {
  //     this.setState({
  //       settings: settingsCookieValue,
  //       darkMode: darkModeCookieValue === 'true',
  //     },() => {
  //       this.getData();
  //     })
  //   }
  //   else {
  //     this.getData();
  //   }
  //
  //   this.setState({
  //     displayCookieBanner: cookieConsent === undefined
  //   })
  //
  //   ReactGA.initialize('UA-113771362-1');
  //   ReactGA.pageview('/');
  // }

  return (
    <>
      <Layout>
          {
            displayCookieBanner && (
            <CookieBanner
              displayCookieExplanation={displayCookieExplanation}
              onCookieBannerSelection={onCookieBannerSelection}
              onCookieExplanation={onCookieExplanation} />
            )
          }

          <Header onAnchorScroll={onAnchorScroll}/>
          <Content>
            <Hero />

            <Settings settings={settings}
              onCheckboxCheck={onCheckboxCheck}
              onNumberChange={onNumberChange}
              onSelectChange={onSelectChange}/>

            <Ipsum ipsum={ipsum}
              getData={getData}
              copyData={copyData}
              ipsumCopied={ipsumCopied}/>

          </Content>
        <Footer />
      </Layout>
    </>
  );
}
