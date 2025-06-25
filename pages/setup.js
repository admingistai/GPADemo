import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAmplitude } from '../context/AmplitudeContext';

export default function Setup() {
  const router = useRouter();
  const { trackEvent } = useAmplitude();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    websiteUrl: '',
    tools: {
      summarize: false,
      remix: false,
      share: false,
      ads: false
    }
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Track Generate Widget button click
    await trackEvent('generate_widget_clicked', {
      website_url: formData.websiteUrl,
      enabled_tools: Object.entries(formData.tools)
        .filter(([_, enabled]) => enabled)
        .map(([tool]) => tool)
    });
    
    // Start loading
    setIsGenerating(true);
    
    // Format the URL to include protocol if missing
    let formattedUrl = formData.websiteUrl.trim();
    if (formattedUrl && !formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      // Store the setup data in Vercel Blob
      const response = await fetch('/api/store-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          websiteUrl: formattedUrl,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store setup data');
      }

      const { setupId, url } = await response.json();

      // Generate the widget code with the setup ID
      const widgetConfig = {
        url: formattedUrl,
        features: formData.tools,
        user: {
          name: formData.name,
          email: formData.email
        },
        setupId // Include the setup ID in the widget config
      };

      const code = `<!-- Gist Widget -->
<script>
  window.gistConfig = ${JSON.stringify(widgetConfig, null, 2)};
</script>
<script src="https://widget.gist.ai/widget.js" async></script>
<!-- End Gist Widget -->`;

      setGeneratedCode(code);
      setShowCode(true);

      // Track successful widget generation
      await trackEvent('widget_generated_success', {
        setup_id: setupId,
        website_url: formattedUrl,
        enabled_tools: Object.entries(formData.tools)
          .filter(([_, enabled]) => enabled)
          .map(([tool]) => tool)
      });
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to generate widget. Please try again.');

      // Track widget generation failure
      await trackEvent('widget_generated_error', {
        error_message: error.message,
        website_url: formattedUrl
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDashboardClick = async () => {
    // Track Dashboard button click
    await trackEvent('dashboard_clicked', {
      from_page: 'setup',
      after_widget_generation: true
    });
    router.push('/dashboard');
  };

  const handlePlatformIntegration = (platform) => {
    // Track platform integration button click
    trackEvent('platform_integration_clicked', {
      platform: platform,
      website_url: formData.websiteUrl
    });

    // For now, show an alert with platform-specific instructions
    // In the future, this could redirect to platform-specific installation pages
    const instructions = {
      wordpress: {
        title: 'WordPress Installation',
        message: 'To install on WordPress:\n\n1. Download the Gist plugin from WordPress.org\n2. Upload and activate the plugin\n3. Go to Settings > Gist and paste your configuration\n4. The widget will appear automatically on your posts'
      },
      shopify: {
        title: 'Shopify Installation', 
        message: 'To install on Shopify:\n\n1. Visit the Shopify App Store\n2. Search for "Gist Answers"\n3. Install the app to your store\n4. Configure your widget settings in the app dashboard'
      },
      drupal: {
        title: 'Drupal Installation',
        message: 'To install on Drupal:\n\n1. Download the Gist module from Drupal.org\n2. Install using Composer or manual upload\n3. Enable the module in Extend\n4. Configure the module settings and add your API key'
      },
      wix: {
        title: 'Wix Installation',
        message: 'To add to your Wix site:\n\n1. Open your Wix Editor\n2. Click "+ Add" and select "More"\n3. Choose "HTML Code" from the menu\n4. Paste your widget code in the HTML Code element\n5. The widget will appear on your published site'
      }
    };

    const instruction = instructions[platform];
    if (instruction) {
      alert(`${instruction.title}\n\n${instruction.message}`);
    }
  };

  return (
    <>
      <Head>
        <title>Setup - Gist</title>
        <meta name="description" content="Configure your Gist widget with custom settings" />
      </Head>

      <div className="setup-container">
        {isGenerating ? (
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <h2>Generating Your Widget...</h2>
            <p>This will only take a moment</p>
          </div>
        ) : !showCode ? (
          <div className="setup-form-container">
            <h1>Setup Your Widget</h1>
            <p className="setup-description">Configure your widget settings and get started in minutes</p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="setup-form">
              <div className="form-section">
                <h2>Your Information</h2>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="websiteUrl">Website URL</label>
                  <input
                    type="text"
                    id="websiteUrl"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    required
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="form-section">
                <h2>Widget Features</h2>
                <div className="features-grid">
                  <label className="feature-toggle">
                    <input
                      type="checkbox"
                      name="tools.summarize"
                      checked={formData.tools.summarize}
                      onChange={handleInputChange}
                    />
                    <span className="feature-label">Summarize</span>
                    <span className="feature-description">AI-powered article summaries</span>
                  </label>

                  <label className="feature-toggle">
                    <input
                      type="checkbox"
                      name="tools.remix"
                      checked={formData.tools.remix}
                      onChange={handleInputChange}
                    />
                    <span className="feature-label">Remix</span>
                    <span className="feature-description">Content remixing and adaptation</span>
                  </label>

                  <label className="feature-toggle">
                    <input
                      type="checkbox"
                      name="tools.share"
                      checked={formData.tools.share}
                      onChange={handleInputChange}
                    />
                    <span className="feature-label">Share</span>
                    <span className="feature-description">Social sharing capabilities</span>
                  </label>

                  <label className="feature-toggle">
                    <input
                      type="checkbox"
                      name="tools.ads"
                      checked={formData.tools.ads}
                      onChange={handleInputChange}
                    />
                    <span className="feature-label">Ads</span>
                    <span className="feature-description">Monetization features</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-button">
                Generate Widget
              </button>
            </form>
          </div>
        ) : (
          <div className="code-result">
            <h1>Your Widget is Ready!</h1>
            <p>Copy the code below and paste it into your website's HTML where you want the widget to appear.</p>
            
            <div className="code-container">
              <pre>
                <code>{generatedCode}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(generatedCode)}
                className="copy-button"
              >
                Copy Code
              </button>
            </div>
            
            <div className="integration-section">
              <h2>Easy Platform Integration</h2>
              <p>Install directly to your platform with one click:</p>
              
              <div className="integration-buttons">
                <button className="integration-btn wordpress-btn" onClick={() => handlePlatformIntegration('wordpress')}>
                  <div className="platform-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.158 12.786L9.46 20.625c.806.237 1.657.375 2.54.375 1.047 0 2.051-.18 2.986-.51-.024-.039-.046-.081-.065-.126l-2.763-7.578zm6.84-4.068c0 1.029-.39 1.741-.726 2.293-.445.726-.861 1.342-.861 2.068 0 .809.616 1.563 1.488 1.563.039 0 .076-.005.114-.007C18.267 16.15 17.143 17 15.846 17c-1.951 0-3.541-1.59-3.541-3.541 0-.456.097-.886.261-1.283l.86-2.365.01-.029c.39-1.067.86-2.293.86-4.154 0-1.563-.571-2.628-1.488-2.628-.651 0-1.097.456-1.097 1.097 0 .511.313.97.313 1.494 0 .809-.611 1.451-1.488 1.451C9.736 7.042 9 6.306 9 5.5c0-1.563 1.284-2.84 2.903-2.84 1.951 0 3.284 1.34 3.284 3.541 0 1.903-.765 3.284-1.488 4.513z"/>
                    </svg>
                  </div>
                  <div className="platform-text">
                    <span className="platform-name">WordPress</span>
                    <span className="platform-desc">Install as Plugin</span>
                  </div>
                </button>
                
                <button className="integration-btn shopify-btn" onClick={() => handlePlatformIntegration('shopify')}>
                  <div className="platform-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.337 2.367c-.314-.024-.643-.012-.98.034-1.109.152-2.372.76-3.302 1.69-.711.713-1.292 1.664-1.426 2.813-.134 1.148.098 2.298.7 3.201l.048.074c.48.72 1.195 1.251 2.016 1.497.821.247 1.714.191 2.516-.154.801-.346 1.484-.913 1.925-1.6.441-.686.634-1.468.544-2.204-.09-.737-.479-1.403-1.097-1.877-.618-.474-1.425-.724-2.275-.705-.849.02-1.644.304-2.24.8-.596.496-.967 1.168-1.047 1.893-.08.725.147 1.453.64 2.053.493.6 1.18 1.036 1.94 1.232.76.195 1.563.142 2.267-.15.704-.292 1.283-.788 1.635-1.398.351-.61.46-1.307.306-1.96-.153-.653-.532-1.231-1.068-1.628-.536-.397-1.196-.593-2.262-.554-.666.039-1.293.309-1.768.76-.476.452-.77 1.063-.828 1.721-.058.658.106 1.318.462 1.86.356.542.86.943 1.421 1.132.562.188 1.167.155 2.267-.094.539-.249.988-.67 1.265-1.188.277-.518.367-1.103.255-1.649-.112-.546-.447-1.032-.945-1.371-.497-.34-1.122-.512-1.76-.486-.639.026-1.244.243-1.706.612-.462.37-.755.866-.826 1.399-.071.533.082 1.073.431 1.523.349.45.841.783 1.388.939.547.155 1.127.124 1.636-.088.509-.212.937-.575 1.206-1.023.27-.447.372-.96.288-1.445-.084-.485-.366-.919-.796-1.222-.43-.304-.97-.456-1.521-.428-.552.028-1.072.216-1.464.53-.393.314-.64.738-.697 1.194-.056.456.071.916.359 1.296.289.38.696.663 1.148.8.452.136.927.115 1.339-.06.412-.175.758-.472.976-.836.218-.364.302-.78.237-1.172-.065-.392-.312-.739-.696-.978-.384-.239-.863-.35-1.351-.313-.488.037-.945.218-1.286.51-.342.292-.559.682-.612 1.099-.053.417.062.838.323 1.186.262.348.632.608 1.043.732.411.125.848.108 1.23-.046.383-.154.706-.415.91-.735.204-.32.283-.692.222-1.048-.06-.356-.267-.67-.583-.885-.316-.215-.71-.315-1.11-.281-.4.034-.775.183-1.056.42-.281.236-.459.551-.502.887-.043.336.05.676.262.957.213.281.513.488.846.584.333.095.686.074.995-.061.308-.135.567-.365.731-.648.164-.283.227-.607.177-.916-.05-.309-.231-.583-.51-.773-.279-.19-.628-.282-.983-.259-.355.023-.687.148-.935.351-.248.203-.405.477-.442.773-.037.296.042.595.223.842.18.247.435.428.719.509.284.081.584.056.846-.072.262-.128.483-.342.622-.603.14-.261.194-.558.152-.838-.042-.28-.185-.532-.403-.711-.218-.179-.492-.269-.773-.253-.281.016-.544.125-.741.308-.197.183-.323.428-.354.691-.031.263.028.529.166.758.138.229.331.407.544.502.213.095.447.101.659.017.213-.084.393-.238.508-.433.115-.195.158-.42.122-.631-.036-.211-.147-.396-.313-.521-.166-.125-.374-.186-.588-.172-.214.014-.416.097-.569.234-.153.137-.252.319-.279.512-.027.193.022.387.138.548.116.161.279.281.459.337.18.056.372.046.541-.028.168-.074.309-.201.397-.358.088-.157.119-.336.088-.506-.031-.17-.117-.321-.243-.43-.126-.109-.284-.169-.446-.169-.162 0-.32.06-.446.169-.126.109-.212.26-.243.43-.031.17.0.349.088.506.088.157.229.284.397.358.169.074.361.084.541.028.18-.056.343-.176.459-.337.116-.161.165-.355.138-.548-.027-.193-.126-.375-.279-.512-.153-.137-.355-.22-.569-.234-.214-.014-.422.047-.588.172-.166.125-.277.31-.313.521-.036.211.007.436.122.631.115.195.295.349.508.433.212.084.446.078.659-.017.213-.095.406-.273.544-.502.138-.229.197-.495.166-.758-.031-.263-.157-.508-.354-.691-.197-.183-.46-.292-.741-.308-.281-.016-.555.074-.773.253-.218.179-.361.431-.403.711-.042.28.012.577.152.838.139.261.36.475.622.603.262.128.562.153.846.072.284-.081.539-.262.719-.509.181-.247.26-.546.223-.842-.037-.296-.194-.57-.442-.773-.248-.203-.58-.328-.935-.351-.355-.023-.704.069-.983.259-.279.19-.46.464-.51.773-.05.309.013.633.177.916.164.283.423.513.731.648.309.135.662.156.995.061.333-.096.633-.303.846-.584.212-.281.305-.621.262-.957-.043-.336-.221-.651-.502-.887-.281-.237-.656-.386-1.056-.42-.4-.034-.794.066-1.11.281-.316.215-.523.529-.583.885-.061.356.018.728.222 1.048.204.32.527.581.91.735.382.154.819.171 1.23.046.411-.124.781-.384 1.043-.732.261-.348.376-.769.323-1.186-.053-.417-.27-.807-.612-1.099-.341-.292-.798-.473-1.286-.51-.488-.037-.967.074-1.351.313-.384.239-.631.586-.696.978-.065.392.019.808.237 1.172.218.364.564.661.976.836.412.175.887.196 1.339.06.452-.137.859-.42 1.148-.8.288-.38.415-.84.359-1.296-.057-.456-.304-.88-.697-1.194-.392-.314-.912-.502-1.464-.53-.551-.028-1.091.124-1.521.428-.43.303-.712.737-.796 1.222-.084.485.018.998.288 1.445.269.448.697.811 1.206 1.023.509.212 1.089.243 1.636.088.547-.156 1.039-.489 1.388-.939.349-.45.502-.99.431-1.523-.071-.533-.364-1.029-.826-1.399-.462-.369-1.067-.586-1.706-.612-.638-.026-1.263.146-1.76.486-.498.339-.833.825-.945 1.371-.112.546-.022 1.131.255 1.649.277.518.726.939 1.265 1.188.539.249 1.144.282 1.706.094.561-.189 1.065-.59 1.421-1.132.356-.542.52-1.202.462-1.86-.058-.658-.352-1.269-.828-1.721-.475-.451-1.102-.721-1.768-.76-.666-.039-1.326.157-1.862.554-.536.397-.915.975-1.068 1.628-.154.653-.045 1.35.306 1.96.352.61.931 1.106 1.635 1.398.704.292 1.507.345 2.267.15.76-.196 1.447-.632 1.94-1.232.493-.6.72-1.328.64-2.053-.08-.725-.451-1.397-1.047-1.893-.596-.496-1.391-.78-2.24-.8-.85-.019-1.657.231-2.275.705-.618.474-1.007 1.14-1.097 1.877-.09.736.103 1.518.544 2.204.441.687 1.124 1.254 1.925 1.6.802.345 1.695.401 2.516.154.821-.246 1.536-.777 2.016-1.497l.048-.074c.602-.903.834-2.053.7-3.201-.134-1.149-.715-2.1-1.426-2.813-.93-.93-2.193-1.538-3.302-1.69-.337-.046-.666-.058-.98-.034-.85.065-1.603.374-2.171.875-.142.125-.27.261-.387.405-.117.144-.224.298-.319.459-.19.322-.337.669-.437 1.031-.1.362-.153.738-.157 1.116v.009c-.008.832.208 1.656.626 2.386.419.73 1.022 1.341 1.746 1.772.724.43 1.544.665 2.376.682.832.017 1.663-.186 2.407-.589.744-.403 1.374-.983 1.824-1.679.45-.696.705-1.484.737-2.284.032-.8-.165-1.596-.571-2.306-.406-.71-1.002-1.308-1.726-1.732-.724-.424-1.549-.658-2.391-.679-.842-.021-1.682.175-2.434.569-.752.394-1.391.964-1.852 1.652-.461.688-.733 1.468-.788 2.263-.055.795.125 1.591.523 2.307.398.716.973 1.326 1.667 1.768.694.442 1.481.7 2.284.748.803.048 1.608-.133 2.335-.524.727-.391 1.351-.953 1.809-1.629.458-.676.736-1.443.805-2.225.069-.782-.084-1.568-.442-2.282-.358-.714-.891-1.331-1.546-1.789-.655-.458-1.406-.741-2.178-.822-.772-.081-1.548.025-2.252.307-.704.282-1.315.727-1.772 1.29-.457.563-.747 1.221-.841 1.906-.094.685-.006 1.38.254 2.017.26.637.652 1.193 1.137 1.613.485.42 1.045.689 1.626.781.581.092 1.168.004 1.703-.255.535-.259.994-.654 1.332-1.147.338-.493.541-1.065.588-1.661.047-.596-.064-1.194-.321-1.737-.257-.543-.642-.998-1.118-1.319-.476-.321-1.022-.495-1.584-.504-.562-.009-1.115.146-1.605.451-.49.305-.903.741-1.198 1.266-.295.525-.463 1.118-.488 1.722-.025.604.098 1.208.357 1.756.259.548.638 1.016 1.1 1.361.462.345.99.553 1.533.603.543.05 1.087-.061 1.578-.322.491-.261.911-.651 1.220-1.132.309-.481.498-1.034.549-1.605.051-.571-.045-1.143-.279-1.662-.234-.519-.585-.965-1.018-1.319-.433-.329-.931-.527-1.446-.574-.515-.047-1.031.04-1.499.253-.468.213-.876.532-1.185.925-.309.393-.508.843-.578 1.307-.07.464-.011.936.171 1.371.182.435.456.818.798 1.113.342.295.735.49 1.143.567.408.077.825.033 1.212-.129.387-.162.728-.409.992-.716.264-.307.443-.658.52-1.019.077-.361.05-.731-.079-1.074-.129-.343-.345-.645-.629-.878-.284-.233-.621-.389-.979-.452-.358-.063-.724-.033-1.063.087-.339.12-.637.329-.866.606-.229.277-.38.609-.438.963-.058.354-.022.716.105 1.051.127.335.338.631.612.861.274.23.595.384.933.447.338.063.684.034 1.006-.084.322-.118.605-.307.821-.549.216-.242.356-.527.407-.828.051-.301.01-.608-.118-.888-.128-.28-.337-.514-.606-.68-.269-.166-.581-.253-.906-.252-.325.001-.637.09-.905.258-.268.168-.476.403-.603.684-.127.281-.167.588-.116.889.051.301.192.586.408.827.216.241.499.429.821.546.322.117.668.145 1.005.081.337-.064.658-.219.932-.449.274-.23.485-.526.612-.862.127-.336.163-.698.105-1.052-.058-.354-.209-.686-.438-.963-.229-.277-.527-.486-.866-.606-.339-.12-.705-.15-1.063-.087-.358.063-.695.219-.979.452-.284.233-.5.535-.629.878-.129.343-.156.713-.079 1.074.077.361.256.712.52 1.019.264.307.605.554.992.716.387.162.804.206 1.212.129.408-.077.801-.272 1.143-.567.342-.295.616-.678.798-1.113.182-.435.241-.907.171-1.371-.07-.464-.269-.914-.578-1.307-.309-.393-.717-.712-1.185-.925-.468-.213-.984-.3-1.499-.253-.515.047-1.013.245-1.446.574-.433.329-.784.775-1.018 1.294-.234.519-.33 1.091-.279 1.662.051.571.24 1.124.549 1.605.309.481.729.871 1.22 1.132.491.261 1.035.372 1.578.322.543-.05 1.071-.258 1.533-.603.462-.345.841-.813 1.1-1.361.259-.548.382-1.152.357-1.756-.025-.604-.193-1.197-.488-1.722-.295-.525-.708-.961-1.198-1.266-.49-.305-1.043-.46-1.605-.451-.562.009-1.108.183-1.584.504-.476.321-.861.776-1.118 1.319-.257.543-.368 1.141-.321 1.737.047.596.25 1.168.588 1.661.338.493.797.888 1.332 1.147.535.259 1.122.347 1.703.255.581-.092 1.141-.361 1.626-.781.485-.42.877-.976 1.137-1.613.26-.637.348-1.332.254-2.017-.094-.685-.384-1.343-.841-1.906-.457-.563-1.068-1.008-1.772-1.29-.704-.282-1.48-.388-2.252-.307-.772.081-1.523.364-2.178.822-.655.458-1.188 1.075-1.546 1.789-.358.714-.511 1.5-.442 2.282.069.782.347 1.549.805 2.225.458.676 1.082 1.238 1.809 1.629.727.391 1.532.572 2.335.524.803-.048 1.59-.306 2.284-.748.694-.442 1.269-1.052 1.667-1.768.398-.716.578-1.512.523-2.307-.055-.795-.327-1.575-.788-2.263-.461-.688-1.1-1.258-1.852-1.652-.752-.394-1.592-.59-2.434-.569-.842.021-1.667.255-2.391.679-.724.424-1.32 1.022-1.726 1.732-.406.71-.603 1.506-.571 2.306.032.8.287 1.588.737 2.284.45.696 1.08 1.276 1.824 1.679.744.403 1.575.606 2.407.589.832-.017 1.652-.252 2.376-.682.724-.431 1.327-1.042 1.746-1.772.418-.73.634-1.554.626-2.386v-.009c-.004-.378-.057-.754-.157-1.116-.1-.362-.247-.709-.437-1.031-.095-.161-.202-.315-.319-.459-.117-.144-.245-.28-.387-.405-.568-.501-1.321-.81-2.171-.875z"/>
                    </svg>
                  </div>
                  <div className="platform-text">
                    <span className="platform-name">Shopify</span>
                    <span className="platform-desc">Install as App</span>
                  </div>
                </button>
                
                <button className="integration-btn drupal-btn" onClick={() => handlePlatformIntegration('drupal')}>
                  <div className="platform-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.78 5.113C14.09 3.425 12.488 1.83 11.998 1.34c-.49.49-2.09 2.085-3.78 3.773C6.537 6.794 5.002 8.329 5.002 10.999c0 3.866 3.135 7 7 7s7-3.134 7-7c0-2.67-1.535-4.205-3.222-5.886zM12.002 16.499c-3.037 0-5.5-2.463-5.5-5.5 0-2.003 1.134-3.258 2.683-4.806 1.217-1.217 2.467-2.467 2.817-2.817.35.35 1.6 1.6 2.817 2.817 1.549 1.548 2.683 2.803 2.683 4.806 0 3.037-2.463 5.5-5.5 5.5z"/>
                      <path d="M9.5 11.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5z"/>
                      <circle cx="14" cy="8" r="1"/>
                    </svg>
                  </div>
                  <div className="platform-text">
                    <span className="platform-name">Drupal</span>
                    <span className="platform-desc">Install as Module</span>
                  </div>
                </button>
                
                <button className="integration-btn wix-btn" onClick={() => handlePlatformIntegration('wix')}>
                  <div className="platform-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.946 8.084a.79.79 0 0 0-.792.787v6.263a.79.79 0 0 0 .792.787.79.79 0 0 0 .792-.787V8.871a.79.79 0 0 0-.792-.787zM8.527 10.84a.79.79 0 0 0-.792.787v3.507a.79.79 0 0 0 .792.787.79.79 0 0 0 .792-.787v-3.507a.79.79 0 0 0-.792-.787zM17.365 10.84a.79.79 0 0 0-.792.787v3.507a.79.79 0 0 0 .792.787.79.79 0 0 0 .792-.787v-3.507a.79.79 0 0 0-.792-.787zM4.108 12.219a.79.79 0 0 0-.792.787v2.128a.79.79 0 0 0 .792.787.79.79 0 0 0 .792-.787v-2.128a.79.79 0 0 0-.792-.787zM21.784 12.219a.79.79 0 0 0-.792.787v2.128a.79.79 0 0 0 .792.787.79.79 0 0 0 .792-.787v-2.128a.79.79 0 0 0-.792-.787z"/>
                    </svg>
                  </div>
                  <div className="platform-text">
                    <span className="platform-name">Wix</span>
                    <span className="platform-desc">Add to Site</span>
                  </div>
                </button>
              </div>
            </div>
            
            <button
              onClick={handleDashboardClick}
              className="dashboard-button"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .setup-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        .error-message {
          background-color: #fee2e2;
          border: 1px solid #ef4444;
          color: #b91c1c;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }

        h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #111827;
        }

        .setup-description {
          font-size: 1.1rem;
          color: #6B7280;
          margin-bottom: 2rem;
        }

        .setup-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #111827;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        input[type="text"],
        input[type="email"] {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          font-size: 1rem;
        }

        input[type="text"]:focus,
        input[type="email"]:focus {
          outline: none;
          border-color: #6366F1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .feature-toggle {
          display: grid;
          grid-template-areas:
            "checkbox header"
            "description description";
          grid-template-columns: auto 1fr;
          gap: 0.5rem 1rem;
          padding: 1rem;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          align-items: center;
        }

        .feature-toggle:hover {
          border-color: #6366F1;
          background: #F9FAFB;
        }

        .feature-toggle input[type="checkbox"] {
          grid-area: checkbox;
          margin: 0;
          width: 1.2rem;
          height: 1.2rem;
        }

        .feature-label {
          grid-area: header;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .feature-description {
          grid-area: description;
          font-size: 0.875rem;
          color: #6B7280;
          margin: 0;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #FF6B6B 0%, #4F46E5 50%, #9333EA 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          background: linear-gradient(135deg, #FF8787 0%, #6366F1 50%, #A855F7 100%);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .loading-screen {
          text-align: center;
          padding: 4rem 0;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #6366F1;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .code-result {
          text-align: center;
        }

        .code-container {
          background: #1F2937;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 2rem 0;
          position: relative;
        }

        pre {
          margin: 0;
          white-space: pre-wrap;
          color: #F9FAFB;
          text-align: left;
          font-family: monospace;
        }

        .copy-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem 1rem;
          background: #374151;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .copy-button:hover {
          background: #4B5563;
        }

        .dashboard-button {
          padding: 1rem 2rem;
          background: #6366F1;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dashboard-button:hover {
          background: #4F46E5;
        }

        .integration-section {
          margin: 3rem 0 2rem 0;
          text-align: center;
        }

        .integration-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #111827;
        }

        .integration-section p {
          color: #6B7280;
          margin-bottom: 2rem;
          font-size: 1rem;
        }

        .integration-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .integration-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          border: 2px solid transparent;
          border-radius: 12px;
          background: white;
          color: #374151;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .integration-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .platform-logo {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .platform-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .platform-name {
          font-weight: 600;
          font-size: 1.1rem;
          color: #111827;
        }

        .platform-desc {
          font-size: 0.875rem;
          color: #6B7280;
        }

        /* WordPress specific styling */
        .wordpress-btn {
          border-color: #21759B;
        }

        .wordpress-btn:hover {
          border-color: #21759B;
          background: #f8fafc;
        }

        .wordpress-btn .platform-logo {
          background: #21759B;
        }

        .wordpress-btn:hover .platform-name {
          color: #21759B;
        }

        /* Shopify specific styling */
        .shopify-btn {
          border-color: #96BF48;
        }

        .shopify-btn:hover {
          border-color: #96BF48;
          background: #f8fafc;
        }

        .shopify-btn .platform-logo {
          background: #96BF48;
        }

        .shopify-btn:hover .platform-name {
          color: #96BF48;
        }

        /* Drupal specific styling */
        .drupal-btn {
          border-color: #0077C0;
        }

        .drupal-btn:hover {
          border-color: #0077C0;
          background: #f8fafc;
        }

        .drupal-btn .platform-logo {
          background: #0077C0;
        }

        .drupal-btn:hover .platform-name {
          color: #0077C0;
        }

        /* Wix specific styling */
        .wix-btn {
          border-color: #0C6EFC;
        }

        .wix-btn:hover {
          border-color: #0C6EFC;
          background: #f8fafc;
        }

        .wix-btn .platform-logo {
          background: #0C6EFC;
        }

        .wix-btn:hover .platform-name {
          color: #0C6EFC;
        }

        @media (max-width: 640px) {
          .setup-container {
            padding: 20px;
          }

          h1 {
            font-size: 2rem;
          }

          .setup-form {
            padding: 1.5rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .integration-buttons {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .integration-btn {
            padding: 1rem;
            font-size: 0.9rem;
          }

          .platform-logo {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </>
  );
} 