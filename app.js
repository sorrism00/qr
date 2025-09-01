document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const barcodeValueSpan = document.getElementById('barcode-value');
    const startScanButton = document.getElementById('start-scan');
    const stopScanButton = document.getElementById('stop-scan');

    let codeReader; // ZXing-JS의 BrowserMultiFormatReader 인스턴스
    let selectedDeviceId; // 선택된 카메라 장치 ID

    // 카메라 목록을 가져오고 첫 번째 비디오 장치를 선택
    ZXing.BrowserMultiFormatReader.listVideoInputDevices().then(videoInputDevices => {
        if (videoInputDevices.length > 0) {
            // 보통 후면 카메라를 기본으로 사용 (정확한 후면 카메라 식별은 기기마다 다를 수 있음)
            selectedDeviceId = videoInputDevices[0].deviceId;
            // 후면 카메라를 찾기 위한 더 강력한 로직
            const rearCamera = videoInputDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'));
            if (rearCamera) {
                selectedDeviceId = rearCamera.deviceId;
            }
            console.log(`Using device: ${selectedDeviceId}`);
        } else {
            alert('카메라를 찾을 수 없습니다.');
            startScanButton.disabled = true;
        }
    }).catch(err => {
        console.error(err);
        alert('카메라 접근 중 오류가 발생했습니다. 권한을 확인해주세요.');
        startScanButton.disabled = true;
    });

    const startScanning = () => {
        if (!selectedDeviceId) {
            alert('카메라 장치를 먼저 선택해야 합니다.');
            return;
        }

        // 새로운 인스턴스를 생성하여 이전에 사용된 리소스를 정리
        codeReader = new ZXing.BrowserMultiFormatReader();
        console.log('ZXing codeReader initialized');

        codeReader.decodeFromVideoDevice(selectedDeviceId, video, (result, err) => {
            if (result) {
                // 바코드 스캔 성공
                console.log('Scanned:', result.getText());
                barcodeValueSpan.textContent = result.getText();
                // 한 번 스캔하면 스캔을 중지 (선택 사항)
                stopScanning();
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                // NotFoundException은 계속 스캔 중일 때 발생하는 정상적인 에러이므로 무시
                console.error(err);
                barcodeValueSpan.textContent = `오류: ${err.message}`;
            }
        });

        startScanButton.disabled = true;
        stopScanButton.disabled = false;
    };

    const stopScanning = () => {
        if (codeReader) {
            codeReader.reset(); // 스캔 중지 및 리소스 해제
            console.log('ZXing codeReader reset');
        }
        barcodeValueSpan.textContent = '없음';
        startScanButton.disabled = false;
        stopScanButton.disabled = true;
    };

    startScanButton.addEventListener('click', startScanning);
    stopScanButton.addEventListener('click', stopScanning);

    // 페이지 로드 시 바로 스캔 시작을 원한다면
    // startScanning();
});
